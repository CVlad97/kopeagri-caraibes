-- Transactional pilot on existing Kopé tables; commercial opening stays explicit.
create table kopeagri.commerce_settings (id boolean primary key default true check(id), pilot_enabled boolean not null default false);
insert into kopeagri.commerce_settings(id,pilot_enabled) values(true,false);
alter table kopeagri.commerce_settings enable row level security;
create policy settings_read on kopeagri.commerce_settings for select to authenticated using(true);
grant select on kopeagri.commerce_settings to authenticated;
create view api.commerce_settings with(security_invoker=true) as select * from kopeagri.commerce_settings;
grant select on api.commerce_settings to authenticated;
alter table kopeagri.orders add column seller_id uuid references auth.users(id), add column lot_id uuid references kopeagri.lots(id), add column quantity numeric(14,3), add column request_key uuid, add column fulfilment_note text not null default '';
create unique index orders_request_key on kopeagri.orders(owner_id,request_key);
create index orders_seller_id on kopeagri.orders(seller_id);
create table kopeagri.order_events(id bigint generated always as identity primary key, order_id uuid not null references kopeagri.orders(id), actor_id uuid not null references auth.users(id), status text not null, note text not null default '', created_at timestamptz not null default now());
alter table kopeagri.order_events enable row level security;
-- Replace permissive legacy policies, without modifying DELIKREOL.
drop policy if exists auth_insert on kopeagri.lots;
drop policy if exists auth_update on kopeagri.lots;
drop policy if exists public_select on kopeagri.lots;
create policy lots_read on kopeagri.lots for select to authenticated using(active or owner_id=auth.uid());
drop policy if exists auth_insert on kopeagri.orders;
drop policy if exists auth_update on kopeagri.orders;
drop policy if exists auth_select on kopeagri.orders;
create policy orders_read on kopeagri.orders for select to authenticated using(owner_id=auth.uid() or seller_id=auth.uid() or exists(select 1 from kopeagri.partner_reviewers r where r.user_id=auth.uid()));
create policy events_read on kopeagri.order_events for select to authenticated using(exists(select 1 from kopeagri.orders o where o.id=order_id));
revoke all on kopeagri.lots,kopeagri.orders from anon,authenticated;
grant select on kopeagri.lots,kopeagri.orders,kopeagri.order_events to authenticated;
create or replace view api.lots with(security_invoker=true) as select * from kopeagri.lots;
create or replace view api.orders with(security_invoker=true) as select * from kopeagri.orders;
create view api.order_events with(security_invoker=true) as select * from kopeagri.order_events;
revoke all on api.lots,api.orders,api.order_events from anon,authenticated;
grant select on api.lots,api.orders,api.order_events to authenticated;

-- Privileged internal functions are necessary for atomic cross-owner stock reservation.
-- Each checks the authenticated actor, validated application, and pilot switch.
create function kopeagri.publish_pilot_lot(p_product text,p_qty numeric,p_unit text,p_price numeric,p_commune text,p_available text)
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); new_id uuid;
begin
 if u is null or not exists(select 1 from kopeagri.commerce_settings where pilot_enabled) then raise exception 'Pilote fermé'; end if;
 if not exists(select 1 from kopeagri.partner_applications where user_id=u and status='approved' and role in ('producteur','pecheur','fournisseur','gie')) then raise exception 'Dossier vendeur validé requis'; end if;
 if p_qty is null or p_qty<=0 or p_qty>1000000000 or p_price is null or p_price<0 or p_price>10000000 or p_qty<>round(p_qty,3) or p_price<>round(p_price,2) or length(trim(coalesce(p_product,''))) not between 1 and 200 or p_unit not in ('kg','pièce','litre','caisse') or p_unit is null or length(trim(coalesce(p_commune,''))) not between 1 and 100 or length(coalesce(p_available,''))>200 then raise exception 'Informations de lot invalides'; end if;
 insert into kopeagri.lots(owner_id,product,qty,unit,price_per_unit,commune,available_date,status,active) values(u,trim(p_product),p_qty,p_unit,p_price,trim(p_commune),p_available,'available',true) returning id into new_id;
 return new_id;
end $$;

create function kopeagri.reserve_pilot_lot(p_lot uuid,p_qty numeric,p_request uuid,p_delivery text)
returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); l kopeagri.lots%rowtype; prior kopeagri.orders%rowtype; new_id uuid; buyer text;
begin
 if u is null or not exists(select 1 from kopeagri.commerce_settings where pilot_enabled) then raise exception 'Pilote fermé'; end if;
 if p_request is null or p_qty is null or p_qty<=0 or p_qty>1000000000 or p_qty<>round(p_qty,3) or length(trim(coalesce(p_delivery,''))) not between 1 and 1000 then raise exception 'Quantité et retrait/livraison requis'; end if;
 select coalesce(nullif(company,''),full_name) into buyer from kopeagri.partner_applications where user_id=u and status='approved' and role in ('acheteur_b2b','acheteur_b2c','gie','fournisseur');
 if buyer is null then raise exception 'Dossier acheteur validé requis'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_request::text,0));
 select * into prior from kopeagri.orders where owner_id=u and request_key=p_request;
 if found then
  if prior.lot_id<>p_lot or prior.quantity<>p_qty or prior.delivery_info<>p_delivery then raise exception 'Clé de requête déjà utilisée'; end if;
  return prior.id;
 end if;
 select * into l from kopeagri.lots where id=p_lot for update;
 if not found or not l.active or l.owner_id is null or l.owner_id=u or l.qty<p_qty or l.status<>'available' then raise exception 'Lot indisponible ou stock insuffisant'; end if;
 if not exists(select 1 from kopeagri.partner_applications where user_id=l.owner_id and status='approved') then raise exception 'Vendeur non validé'; end if;
 new_id:=gen_random_uuid();
 insert into kopeagri.orders(id,owner_id,seller_id,lot_id,quantity,request_key,ref,buyer_name,items,total,commission,status,order_date,delivery_info)
 values(new_id,u,l.owner_id,l.id,p_qty,p_request,'KA-'||upper(substr(replace(new_id::text,'-',''),1,12)),buyer,jsonb_build_array(jsonb_build_object('product',l.product,'qty',p_qty,'unit',l.unit,'price',l.price_per_unit)),round(p_qty*l.price_per_unit::numeric,2),0,'reserved',current_date::text,p_delivery);
 update kopeagri.lots set qty=(qty::numeric-p_qty),updated_at=now() where id=l.id;
 insert into kopeagri.order_events(order_id,actor_id,status,note) values(new_id,u,'reserved','Demande pilote; aucun paiement déclenché.');
 return new_id;
end $$;

create function kopeagri.transition_pilot_order(p_order uuid,p_status text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); o kopeagri.orders%rowtype; allowed boolean:=false;
begin
 if u is null then raise exception 'Connexion requise'; end if;
 select * into o from kopeagri.orders where id=p_order for update;
 if not found or (u is distinct from o.owner_id and u is distinct from o.seller_id) then raise exception 'Commande inaccessible'; end if;
 if p_status is null or length(coalesce(p_note,''))>1000 then raise exception 'Transition invalide'; end if;
 if o.status=p_status then return; end if;
 allowed:=(u=o.seller_id and ((o.status='reserved' and p_status='accepted') or (o.status='accepted' and p_status='ready') or (o.status='ready' and p_status='collected'))) or (u=o.owner_id and o.status='collected' and p_status='delivered') or (o.status in ('reserved','accepted','ready') and p_status='cancelled');
 if allowed is not true then raise exception 'Transition interdite'; end if;
 if p_status in ('collected','delivered','cancelled') and length(trim(coalesce(p_note,'')))=0 then raise exception 'Indiquez une référence ou un motif'; end if;
 if p_status='cancelled' then update kopeagri.lots set qty=(qty::numeric+o.quantity),updated_at=now() where id=o.lot_id; end if;
 update kopeagri.orders set status=p_status,fulfilment_note=coalesce(p_note,''),updated_at=now() where id=o.id;
 insert into kopeagri.order_events(order_id,actor_id,status,note) values(o.id,u,p_status,coalesce(p_note,''));
end $$;
revoke all on function kopeagri.publish_pilot_lot(text,numeric,text,numeric,text,text),kopeagri.reserve_pilot_lot(uuid,numeric,uuid,text),kopeagri.transition_pilot_order(uuid,text,text) from public,anon,authenticated;
grant execute on function kopeagri.publish_pilot_lot(text,numeric,text,numeric,text,text),kopeagri.reserve_pilot_lot(uuid,numeric,uuid,text),kopeagri.transition_pilot_order(uuid,text,text) to authenticated;
create function api.publish_pilot_lot(p_product text,p_qty numeric,p_unit text,p_price numeric,p_commune text,p_available text) returns uuid language sql security invoker set search_path='' as $$ select kopeagri.publish_pilot_lot(p_product,p_qty,p_unit,p_price,p_commune,p_available) $$;
create function api.reserve_pilot_lot(p_lot uuid,p_qty numeric,p_request uuid,p_delivery text) returns uuid language sql security invoker set search_path='' as $$ select kopeagri.reserve_pilot_lot(p_lot,p_qty,p_request,p_delivery) $$;
create function api.transition_pilot_order(p_order uuid,p_status text,p_note text) returns void language sql security invoker set search_path='' as $$ select kopeagri.transition_pilot_order(p_order,p_status,p_note) $$;
revoke all on function api.publish_pilot_lot(text,numeric,text,numeric,text,text),api.reserve_pilot_lot(uuid,numeric,uuid,text),api.transition_pilot_order(uuid,text,text) from public,anon,authenticated;
grant execute on function api.publish_pilot_lot(text,numeric,text,numeric,text,text),api.reserve_pilot_lot(uuid,numeric,uuid,text),api.transition_pilot_order(uuid,text,text) to authenticated;
notify pgrst,'reload schema';