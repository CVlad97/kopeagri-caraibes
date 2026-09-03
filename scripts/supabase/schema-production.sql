-- ============================================================
-- KopéAgri Caraïbes — Schéma production Supabase
-- Projet partagé: boihlgodmclljtckhmgz (DELIKREOL / Kaygo / KopéAgri)
-- Idempotent: rejouable sans erreur
-- Sécurité: RLS activé partout + vues api avec security_invoker
-- ============================================================
-- À exécuter dans: Dashboard Supabase → SQL Editor → Run
--   https://supabase.com/dashboard/project/boihlgodmclljtckhmgz/sql/new
-- ============================================================

-- ===== 0. EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== 1. TABLES =====

-- 1.1 Profils (liés à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'producteur'
    CHECK (role IN ('producteur','proprietaire','gie','acheteur_b2b','transporteur','institution','pecheur','admin')),
  commune text,
  phone text,
  avatar_url text,
  bio text,
  siret text,
  rib text,
  company_name text,
  address text,
  latitude double precision,
  longitude double precision,
  active boolean NOT NULL DEFAULT true,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.2 Producteurs
CREATE TABLE IF NOT EXISTS public.producteurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  email text,
  phone text,
  commune text,
  bio text,
  cultures text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  superficie_ha double precision,
  description text,
  photo_url text,
  avatar_url text,
  geo_lat double precision,
  geo_lng double precision,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.3 Transporteurs / logistique
CREATE TABLE IF NOT EXISTS public.logistics_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  contact_name text,
  phone text,
  commune text,
  services text[] DEFAULT '{}',
  fleet text,
  zone_couverture text[] DEFAULT '{}',
  capacite_kg double precision,
  frigorifique boolean NOT NULL DEFAULT false,
  geo_lat double precision,
  geo_lng double precision,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.4 Distributeurs / acheteurs B2B
CREATE TABLE IF NOT EXISTS public.distributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  contact_name text,
  phone text,
  commune text,
  type text NOT NULL DEFAULT 'grossiste'
    CHECK (type IN ('grossiste','distributeur','transitaire','exportateur','hotel_restaurant')),
  geo_lat double precision,
  geo_lng double precision,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.5 Parcelles
CREATE TABLE IF NOT EXISTS public.parcelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  farm_name text,
  commune text,
  surface_ha double precision,
  soil_type text,
  water_access boolean,
  status text,
  current_crop text,
  cultures text[] DEFAULT '{}',
  rental_terms text,
  geo_lat double precision,
  geo_lng double precision,
  altitude_m integer,
  irrigation boolean NOT NULL DEFAULT false,
  certification text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.6 Ressources partagées (matériel, stockage)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'materiel',
  owner_name text,
  commune text,
  rate double precision DEFAULT 0,
  unit text,
  quantity double precision DEFAULT 0,
  description text,
  available boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.7 Réservations de ressources
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text,
  resource_name text,
  booker_name text,
  booker_phone text,
  dates text,
  message text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.8 Lots (marketplace)
CREATE TABLE IF NOT EXISTS public.lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product text NOT NULL DEFAULT '',
  producer_id uuid,
  commune text,
  qty double precision DEFAULT 0,
  unit text,
  price_per_unit double precision DEFAULT 0,
  quality text,
  available_date text,
  status text,
  certifications text[] DEFAULT '{}',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.9 Commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ref text,
  buyer_name text,
  items jsonb DEFAULT '[]',
  total double precision DEFAULT 0,
  commission double precision DEFAULT 0,
  status text,
  order_date text,
  delivery_info text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.10 Appels d'offres (RFQ)
CREATE TABLE IF NOT EXISTS public.rfq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'transport'
    CHECK (type IN ('transport','achat','stockage','export')),
  status text NOT NULL DEFAULT 'brouillon'
    CHECK (status IN ('brouillon','envoyee','confirmee','en_cours','livree','annulee')),
  producer_id uuid,
  producer_phone text,
  commune_from text,
  commune_to text,
  products text[] DEFAULT '{}',
  quantity text,
  desired_date text,
  budget_max double precision,
  notes text,
  partners jsonb DEFAULT '[]',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.11 Partenaires RFQ
CREATE TABLE IF NOT EXISTS public.rfq_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfq(id) ON DELETE CASCADE,
  partner_id uuid,
  name text NOT NULL DEFAULT '',
  phone text,
  commune text,
  type text NOT NULL DEFAULT 'transporteur'
    CHECK (type IN ('transporteur','acheteur','stockeur','exportateur')),
  status text NOT NULL DEFAULT 'en_attente'
    CHECK (status IN ('en_attente','contacte','interesse','confirme','refuse')),
  proposed_price double precision,
  proposed_date text,
  notes text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.12 Documents de facturation
CREATE TABLE IF NOT EXISTS public.billing_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'devis' CHECK (type IN ('devis','facture','bon_commande')),
  reference text,
  status text NOT NULL DEFAULT 'brouillon'
    CHECK (status IN ('brouillon','envoye','accepte','refuse','paye','annule','expire')),
  payment_status text NOT NULL DEFAULT 'non_paye'
    CHECK (payment_status IN ('non_paye','partiel','paye','en_retard')),
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  client_siret text,
  subtotal_ht double precision DEFAULT 0,
  total_tva double precision DEFAULT 0,
  total_ttc double precision DEFAULT 0,
  due_date text,
  sent_at timestamptz,
  paid_at timestamptz,
  notes text,
  qonto_synced boolean NOT NULL DEFAULT false,
  pdf_url text,
  geo_lat double precision,
  geo_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.13 Lignes de documents
CREATE TABLE IF NOT EXISTS public.billing_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.billing_documents(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  quantity double precision DEFAULT 1,
  unit text,
  unit_price double precision DEFAULT 0,
  tva_rate double precision DEFAULT 0,
  total_ht double precision DEFAULT 0,
  total_ttc double precision DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.14 Transactions Qonto (rapprochement bancaire)
CREATE TABLE IF NOT EXISTS public.qonto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date text,
  amount double precision DEFAULT 0,
  description text,
  category text NOT NULL DEFAULT 'autre'
    CHECK (category IN ('vente','achat','commission','abonnement','transport','carburant','fourniture','salaire','loyer','assurance','autre')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','pending','failed')),
  linked_document_id uuid REFERENCES public.billing_documents(id) ON DELETE SET NULL,
  qonto_id text,
  reconciliation_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.15 Abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text,
  plan text NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit','konbit','lakou','plantasyon')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','en_attente','expiree','resiliee')),
  started_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT false,
  payment_method text CHECK (payment_method IN ('virement','cheque','especes','mobile_money','carte')),
  amount double precision DEFAULT 0,
  reference text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.16 Commissions plateforme
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_ref text,
  plan text,
  base_amount double precision DEFAULT 0,
  rate double precision DEFAULT 0,
  amount double precision DEFAULT 0,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('due','facturee','payee')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.17 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text DEFAULT '',
  title text DEFAULT '',
  message text,
  body text,
  read boolean NOT NULL DEFAULT false,
  link text,
  action_url text,
  channel text CHECK (channel IN ('whatsapp','email','sms','push','in_app')),
  status text CHECK (status IN ('en_attente','envoyee','echouee','lue')),
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.18 Références de prix marché
CREATE TABLE IF NOT EXISTS public.price_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  commune text,
  avg_price double precision,
  unit text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.19 Journal d'audit (service_role uniquement — aucun accès anon/authenticated)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text,
  record_id text,
  action text,
  user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.20 Compteurs de documents (référence DEV-2026-001)
CREATE TABLE IF NOT EXISTS public.document_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL CHECK (doc_type IN ('devis','facture','bon_commande')),
  year integer NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc_type, year)
);

-- ===== 2. INDEX =====
CREATE INDEX IF NOT EXISTS idx_lots_created ON public.lots (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lots_commune ON public.lots (commune);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.lots (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_rfq_status ON public.rfq (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_producteurs_commune ON public.producteurs (commune);
CREATE INDEX IF NOT EXISTS idx_billing_documents_owner ON public.billing_documents (owner_id);
CREATE INDEX IF NOT EXISTS idx_billing_lines_doc ON public.billing_lines (document_id);

-- ===== 3. RLS (Row Level Security) =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qonto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_counters ENABLE ROW LEVEL SECURITY;

-- 3.1 profiles — chacun voit et modifie uniquement son profil (RIB/SIRET jamais publics)
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 3.2 Données publiques marketplace — lecture anon+authenticated (offres visibles)
DROP POLICY IF EXISTS public_select ON public.producteurs;
CREATE POLICY public_select ON public.producteurs
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.logistics_providers;
CREATE POLICY public_select ON public.logistics_providers
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.distributors;
CREATE POLICY public_select ON public.distributors
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.resources;
CREATE POLICY public_select ON public.resources
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.lots;
CREATE POLICY public_select ON public.lots
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.rfq;
CREATE POLICY public_select ON public.rfq
  FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS public_select ON public.price_references;
CREATE POLICY public_select ON public.price_references
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS public_select ON public.parcelles;
CREATE POLICY public_select ON public.parcelles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS public_select ON public.bookings;
CREATE POLICY public_select ON public.bookings
  FOR SELECT TO authenticated USING (true);

-- 3.3 Écritures — authenticated uniquement (pilote: membres du GIE de confiance)
DROP POLICY IF EXISTS auth_insert ON public.producteurs;
CREATE POLICY auth_insert ON public.producteurs
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.producteurs;
CREATE POLICY auth_update ON public.producteurs
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.logistics_providers;
CREATE POLICY auth_insert ON public.logistics_providers
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.logistics_providers;
CREATE POLICY auth_update ON public.logistics_providers
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.distributors;
CREATE POLICY auth_insert ON public.distributors
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.distributors;
CREATE POLICY auth_update ON public.distributors
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.parcelles;
CREATE POLICY auth_insert ON public.parcelles
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.parcelles;
CREATE POLICY auth_update ON public.parcelles
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.resources;
CREATE POLICY auth_insert ON public.resources
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.resources;
CREATE POLICY auth_update ON public.resources
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.bookings;
CREATE POLICY auth_insert ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.bookings;
CREATE POLICY auth_update ON public.bookings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_insert ON public.lots;
CREATE POLICY auth_insert ON public.lots
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.lots;
CREATE POLICY auth_update ON public.lots
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.orders;
CREATE POLICY auth_insert ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_select ON public.orders;
CREATE POLICY auth_select ON public.orders
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS auth_update ON public.orders;
CREATE POLICY auth_update ON public.orders
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.rfq;
CREATE POLICY auth_insert ON public.rfq
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_update ON public.rfq;
CREATE POLICY auth_update ON public.rfq
  FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR owner_id IS NULL) WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS auth_insert ON public.rfq_partners;
CREATE POLICY auth_insert ON public.rfq_partners
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS auth_select ON public.rfq_partners;
CREATE POLICY auth_select ON public.rfq_partners
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS auth_update ON public.rfq_partners;
CREATE POLICY auth_update ON public.rfq_partners
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_insert ON public.notifications;
CREATE POLICY auth_insert ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
DROP POLICY IF EXISTS auth_select ON public.notifications;
CREATE POLICY auth_select ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
DROP POLICY IF EXISTS auth_update ON public.notifications;
CREATE POLICY auth_update ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS auth_all ON public.document_counters;
CREATE POLICY auth_all ON public.document_counters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.4 Données sensibles (facturation, banque, abonnements) — propriétaire uniquement
DROP POLICY IF EXISTS billing_owner ON public.billing_documents;
CREATE POLICY billing_owner ON public.billing_documents
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS billing_lines_owner ON public.billing_lines;
CREATE POLICY billing_lines_owner ON public.billing_lines
  FOR ALL TO authenticated
  USING (document_id IN (SELECT id FROM public.billing_documents WHERE owner_id = auth.uid() OR owner_id IS NULL))
  WITH CHECK (document_id IN (SELECT id FROM public.billing_documents WHERE owner_id = auth.uid() OR owner_id IS NULL));

DROP POLICY IF EXISTS qonto_owner ON public.qonto_transactions;
CREATE POLICY qonto_owner ON public.qonto_transactions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS subs_owner ON public.subscriptions;
CREATE POLICY subs_owner ON public.subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS commissions_select ON public.commissions;
CREATE POLICY commissions_select ON public.commissions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

-- 3.5 audit_log — AUCUNE policy: deny-all pour anon/authenticated (service_role passe outre)

-- ===== 4. TRIGGER: création automatique du profil à l'inscription =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, commune, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'producteur'),
    COALESCE(NEW.raw_user_meta_data->>'commune', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 5. updated_at automatique =====
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_profiles ON public.profiles;
CREATE TRIGGER trg_touch_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_producteurs ON public.producteurs;
CREATE TRIGGER trg_touch_producteurs BEFORE UPDATE ON public.producteurs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_lots ON public.lots;
CREATE TRIGGER trg_touch_lots BEFORE UPDATE ON public.lots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_orders ON public.orders;
CREATE TRIGGER trg_touch_orders BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_rfq ON public.rfq;
CREATE TRIGGER trg_touch_rfq BEFORE UPDATE ON public.rfq
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== 6. VUES schéma api (PostgREST n'expose que api sur ce projet) =====
-- security_invoker = true → le RLS de la table source s'applique au rôle appelant
CREATE OR REPLACE VIEW api.profiles WITH (security_invoker = true) AS SELECT * FROM public.profiles;
CREATE OR REPLACE VIEW api.producteurs WITH (security_invoker = true) AS SELECT * FROM public.producteurs;
CREATE OR REPLACE VIEW api.logistics_providers WITH (security_invoker = true) AS SELECT * FROM public.logistics_providers;
CREATE OR REPLACE VIEW api.distributors WITH (security_invoker = true) AS SELECT * FROM public.distributors;
CREATE OR REPLACE VIEW api.parcelles WITH (security_invoker = true) AS SELECT * FROM public.parcelles;
CREATE OR REPLACE VIEW api.resources WITH (security_invoker = true) AS SELECT * FROM public.resources;
CREATE OR REPLACE VIEW api.bookings WITH (security_invoker = true) AS SELECT * FROM public.bookings;
CREATE OR REPLACE VIEW api.lots WITH (security_invoker = true) AS SELECT * FROM public.lots;
CREATE OR REPLACE VIEW api.orders WITH (security_invoker = true) AS SELECT * FROM public.orders;
CREATE OR REPLACE VIEW api.rfq WITH (security_invoker = true) AS SELECT * FROM public.rfq;
CREATE OR REPLACE VIEW api.rfq_partners WITH (security_invoker = true) AS SELECT * FROM public.rfq_partners;
CREATE OR REPLACE VIEW api.billing_documents WITH (security_invoker = true) AS SELECT * FROM public.billing_documents;
CREATE OR REPLACE VIEW api.billing_lines WITH (security_invoker = true) AS SELECT * FROM public.billing_lines;
CREATE OR REPLACE VIEW api.qonto_transactions WITH (security_invoker = true) AS SELECT * FROM public.qonto_transactions;
CREATE OR REPLACE VIEW api.subscriptions WITH (security_invoker = true) AS SELECT * FROM public.subscriptions;
CREATE OR REPLACE VIEW api.commissions WITH (security_invoker = true) AS SELECT * FROM public.commissions;
CREATE OR REPLACE VIEW api.notifications WITH (security_invoker = true) AS SELECT * FROM public.notifications;
CREATE OR REPLACE VIEW api.price_references WITH (security_invoker = true) AS SELECT * FROM public.price_references;
CREATE OR REPLACE VIEW api.audit_log WITH (security_invoker = true) AS SELECT * FROM public.audit_log;
CREATE OR REPLACE VIEW api.document_counters WITH (security_invoker = true) AS SELECT * FROM public.document_counters;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.producteurs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.logistics_providers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.distributors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.parcelles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.resources TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.lots TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.rfq TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.rfq_partners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.billing_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.billing_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.qonto_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.subscriptions TO authenticated;
GRANT SELECT ON api.commissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.notifications TO authenticated;
GRANT SELECT ON api.price_references TO anon, authenticated;
GRANT SELECT ON api.audit_log TO service_role;
GRANT SELECT, INSERT, UPDATE ON api.document_counters TO authenticated;

-- Recharger le cache PostgREST pour exposer les nouvelles vues
NOTIFY pgrst, 'reload schema';

-- ===== FIN =====
-- Vérification: SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1;
-- 21 tables attendues (20 + aucune double)
