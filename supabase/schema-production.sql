-- ============================================================
-- KOPÉAGRI CARAÏBES — PRODUCTION SUPABASE SQL SCRIPT
-- Version: 1.1.0  |  Date: 2026-07-07
-- All 20 tables, RLS policies, functions, triggers, views, seed data
-- ============================================================
--
-- ╔══════════════════════════════════════════════════════════╗
-- ║  4-STEP DEPLOYMENT PROCESS                               ║
-- ╠══════════════════════════════════════════════════════════╣
-- ║                                                          ║
-- ║  Step 1 — Enable extensions via Dashboard                ║
-- ║  ▸ Dashboard → Database → Extensions                    ║
-- ║    • Enable "uuid-ossp"  (usually already enabled)       ║
-- ║    • Enable "postgis"   (optional, for geo features)    ║
-- ║                                                          ║
-- ║  Step 2 — Run this SQL script                            ║
-- ║  ▸ Dashboard → SQL Editor → Paste this file → Run       ║
-- ║                                                          ║
-- ║  Step 3 — Create storage bucket                          ║
-- ║  ▸ Dashboard → Storage → New bucket                     ║
-- ║    • Name: "photos"  |  Public: false                    ║
-- ║    • Allowed MIME types: image/*                        ║
-- ║                                                          ║
-- ║  Step 4 — Enable Email/Password auth                     ║
-- ║  ▸ Dashboard → Authentication → Providers               ║
-- ║    • Enable "Email" provider                             ║
-- ║                                                          ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- TABLE NAME MAPPING (syncService.ts TABLE_MAP should use):
--   localStorage key  →  Supabase table name
--   producers         →  producteurs
--   logistics         →  logistics_providers
--   distributors      →  distributors
--   plots             →  parcelles
--   resources         →  resources         ← NEW
--   bookings          →  bookings          ← NEW
--   lots              →  lots              ← NEW
--   orders            →  orders            ← NEW
--   rfq               →  rfq
--   notifications     →  notifications
--   documents         →  billing_documents
--   qonto             →  qonto_transactions
--   subscriptions     →  subscriptions
--   commissions       →  commissions
--
-- NOTE: No CREATE EXTENSION statements here — they MUST be
-- enabled via the Supabase Dashboard (Step 1 above).
-- postgis gist indexes replaced with btree on lat/lng columns.
-- pg_cron jobs replaced with Dashboard → Cron instructions.
-- ============================================================

-- ===== ENUMS =====

CREATE TYPE user_role AS ENUM (
  'producteur', 'proprietaire', 'cooperative', 'acheteur_b2b',
  'transporteur', 'institution', 'admin'
);

CREATE TYPE doc_type AS ENUM ('devis', 'facture', 'bon_commande');
CREATE TYPE doc_status AS ENUM ('brouillon', 'envoye', 'accepte', 'refuse', 'paye', 'annule', 'expire');
CREATE TYPE payment_status AS ENUM ('non_paye', 'partiel', 'paye', 'en_retard');

CREATE TYPE rfq_status AS ENUM ('brouillon', 'envoyee', 'confirmee', 'en_cours', 'livree', 'annulee');
CREATE TYPE rfq_type AS ENUM ('transport', 'achat', 'stockage', 'export');
CREATE TYPE partner_status AS ENUM ('en_attente', 'contacte', 'interesse', 'confirme', 'refuse');
CREATE TYPE partner_type AS ENUM ('transporteur', 'acheteur', 'stockeur', 'exportateur');

CREATE TYPE plan_type AS ENUM ('gratuit', 'konbit', 'lakou', 'plantasyon');
CREATE TYPE sub_status AS ENUM ('active', 'en_attente', 'expiree', 'resiliee');
CREATE TYPE commission_status AS ENUM ('a_payer', 'payee', 'en_attente');
CREATE TYPE payment_method AS ENUM ('virement', 'cheque', 'especes', 'mobile_money', 'carte');

CREATE TYPE notif_channel AS ENUM ('whatsapp', 'email', 'sms', 'push', 'in_app');
CREATE TYPE notif_status AS ENUM ('en_attente', 'envoyee', 'echouee', 'lue');

CREATE TYPE qonto_tx_category AS ENUM (
  'vente', 'achat', 'commission', 'abonnement', 'transport',
  'carburant', 'fourniture', 'salaire', 'loyer', 'assurance', 'autre'
);
CREATE TYPE qonto_tx_status AS ENUM ('completed', 'pending', 'failed');

-- New enums for added tables
CREATE TYPE resource_type AS ENUM ('materiel', 'chambre_froide', 'camion', 'main_oeuvre', 'intrant', 'emballage');
CREATE TYPE lot_status AS ENUM ('draft', 'pending', 'approved', 'sold', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'preparing', 'delivered', 'cancelled');
CREATE TYPE plot_status AS ENUM ('available', 'cultivated', 'fallow', 'rented');

-- ============================================================
-- TABLE 1: PROFILES (extension of auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'producteur',
  commune       TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  siret         TEXT,
  rib           TEXT,
  company_name  TEXT,
  address       TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  active        BOOLEAN NOT NULL DEFAULT true,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_commune ON public.profiles(commune);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(active) WHERE active = true;
-- Replaced gist(point(longitude,latitude)) with btree indexes (postgis not assumed)
CREATE INDEX idx_profiles_lat ON public.profiles(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_profiles_lng ON public.profiles(longitude) WHERE longitude IS NOT NULL;

-- ============================================================
-- TABLE 2: PRODUCTEURS (detailed producer profiles)
-- ============================================================
CREATE TABLE public.producteurs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact       TEXT NOT NULL,
  phone         TEXT NOT NULL,
  commune       TEXT NOT NULL,
  cultures      TEXT[] NOT NULL DEFAULT '{}',
  certifications TEXT[] NOT NULL DEFAULT '{}',
  superficie_ha DOUBLE PRECISION DEFAULT 0,
  description   TEXT,
  photo_url     TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  geo_lat       DOUBLE PRECISION,
  geo_lng       DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_producteurs_owner ON public.producteurs(owner_id);
CREATE INDEX idx_producteurs_commune ON public.producteurs(commune);
CREATE INDEX idx_producteurs_active ON public.producteurs(active) WHERE active = true;
CREATE INDEX idx_producteurs_cultures ON public.producteurs USING gin(cultures);

-- ============================================================
-- TABLE 3: LOGISTICS_PROVIDERS (transporters)
-- ============================================================
CREATE TABLE public.logistics_providers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact       TEXT NOT NULL,
  phone         TEXT NOT NULL,
  commune       TEXT NOT NULL,
  services      TEXT[] NOT NULL DEFAULT '{}',
  fleet         TEXT,
  zone_couverture TEXT[] DEFAULT '{}',
  capacite_kg   INTEGER DEFAULT 0,
  frigorifique  BOOLEAN DEFAULT false,
  active        BOOLEAN NOT NULL DEFAULT true,
  geo_lat       DOUBLE PRECISION,
  geo_lng       DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logistics_owner ON public.logistics_providers(owner_id);
CREATE INDEX idx_logistics_active ON public.logistics_providers(active) WHERE active = true;
CREATE INDEX idx_logistics_services ON public.logistics_providers USING gin(services);

-- ============================================================
-- TABLE 4: DISTRIBUTORS
-- ============================================================
CREATE TABLE public.distributors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact       TEXT NOT NULL,
  phone         TEXT NOT NULL,
  commune       TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('grossiste','distributeur','transitaire','exportateur','hotel_restaurant')),
  active        BOOLEAN NOT NULL DEFAULT true,
  geo_lat       DOUBLE PRECISION,
  geo_lng       DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_distributors_owner ON public.distributors(owner_id);
CREATE INDEX idx_distributors_type ON public.distributors(type);

-- ============================================================
-- TABLE 5: PARCELLES (agricultural plots, geo-located)
-- ============================================================
CREATE TABLE public.parcelles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  commune       TEXT NOT NULL,
  superficie_ha DOUBLE PRECISION NOT NULL DEFAULT 0,
  cultures      TEXT[] NOT NULL DEFAULT '{}',
  geo_lat       DOUBLE PRECISION NOT NULL,
  geo_lng       DOUBLE PRECISION NOT NULL,
  altitude_m    INTEGER,
  irrigation    BOOLEAN DEFAULT false,
  certification TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parcelles_owner ON public.parcelles(owner_id);
-- Replaced gist index with btree (postgis not assumed)
CREATE INDEX idx_parcelles_lat ON public.parcelles(geo_lat) WHERE geo_lat IS NOT NULL;
CREATE INDEX idx_parcelles_lng ON public.parcelles(geo_lng) WHERE geo_lng IS NOT NULL;

-- ============================================================
-- TABLE 6: RESOURCES (shared equipment, cold rooms, labor, etc.)
-- ============================================================
CREATE TABLE public.resources (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  type          resource_type NOT NULL DEFAULT 'materiel',
  owner_name    TEXT,
  commune       TEXT,
  rate          NUMERIC(10,2) DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT '',
  quantity      INTEGER DEFAULT 0,
  description   TEXT,
  available     BOOLEAN NOT NULL DEFAULT true,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_owner ON public.resources(owner_id);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_commune ON public.resources(commune);
CREATE INDEX idx_resources_active ON public.resources(active) WHERE active = true;

-- ============================================================
-- TABLE 7: BOOKINGS (reservations for resources)
-- ============================================================
CREATE TABLE public.bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id   TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  booker_name   TEXT NOT NULL,
  booker_phone  TEXT NOT NULL,
  dates         TEXT NOT NULL,
  message       TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_resource ON public.bookings(resource_id);
CREATE INDEX idx_bookings_active ON public.bookings(active) WHERE active = true;

-- ============================================================
-- TABLE 8: LOTS (product lots for marketplace)
-- ============================================================
CREATE TABLE public.lots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product       TEXT NOT NULL,
  producer_id   UUID REFERENCES public.producteurs(id) ON DELETE SET NULL,
  commune       TEXT,
  qty           NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  quality       TEXT,
  available_date TEXT,
  status        lot_status NOT NULL DEFAULT 'pending',
  certifications TEXT[] NOT NULL DEFAULT '{}',
  image_url     TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lots_owner ON public.lots(owner_id);
CREATE INDEX idx_lots_product ON public.lots(product);
CREATE INDEX idx_lots_status ON public.lots(status);
CREATE INDEX idx_lots_active ON public.lots(active) WHERE active = true;

-- ============================================================
-- TABLE 9: ORDERS (purchase orders)
-- ============================================================
CREATE TABLE public.orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ref           TEXT NOT NULL,
  buyer_name    TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission    NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        order_status NOT NULL DEFAULT 'pending',
  order_date    DATE,
  delivery_info TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_owner ON public.orders(owner_id);
CREATE INDEX idx_orders_ref ON public.orders(ref);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_active ON public.orders(active) WHERE active = true;

-- ============================================================
-- TABLE 10: RFQ (Calls for Tender)
-- ============================================================
CREATE TABLE public.rfq (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  type            rfq_type NOT NULL,
  status          rfq_status NOT NULL DEFAULT 'brouillon',
  producteur      TEXT NOT NULL,
  producteur_phone TEXT NOT NULL,
  commune_depart  TEXT NOT NULL,
  commune_arrivee TEXT,
  produits        TEXT[] NOT NULL DEFAULT '{}',
  quantite        TEXT NOT NULL,
  date_souhaitee  DATE,
  budget_max      NUMERIC(12,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rfq_owner ON public.rfq(owner_id);
CREATE INDEX idx_rfq_status ON public.rfq(status);
CREATE INDEX idx_rfq_type ON public.rfq(type);
CREATE INDEX idx_rfq_date ON public.rfq(date_souhaitee);

-- ============================================================
-- TABLE 11: RFQ_PARTNERS (partners linked to a call for tender)
-- ============================================================
CREATE TABLE public.rfq_partners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id        UUID NOT NULL REFERENCES public.rfq(id) ON DELETE CASCADE,
  partner_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  commune       TEXT,
  type          partner_type NOT NULL,
  status        partner_status NOT NULL DEFAULT 'en_attente',
  proposed_price NUMERIC(12,2),
  proposed_date  DATE,
  notes          TEXT,
  responded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rfq_partners_rfq ON public.rfq_partners(rfq_id);
CREATE INDEX idx_rfq_partners_status ON public.rfq_partners(status);

-- ============================================================
-- TABLE 12: BILLING_DOCUMENTS (quotes, invoices, purchase orders)
-- ============================================================
CREATE TABLE public.billing_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            doc_type NOT NULL,
  reference       TEXT NOT NULL UNIQUE,
  status          doc_status NOT NULL DEFAULT 'brouillon',
  payment_status  payment_status NOT NULL DEFAULT 'non_paye',
  client_name     TEXT NOT NULL,
  client_email    TEXT,
  client_phone    TEXT,
  client_address  TEXT,
  client_siret    TEXT,
  subtotal_ht     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tva       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date        DATE NOT NULL,
  sent_at         TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  qonto_synced    BOOLEAN NOT NULL DEFAULT false,
  pdf_url         TEXT,
  geo_lat         DOUBLE PRECISION,
  geo_lng         DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_owner ON public.billing_documents(owner_id);
CREATE INDEX idx_billing_type ON public.billing_documents(type);
CREATE INDEX idx_billing_status ON public.billing_documents(status);
CREATE INDEX idx_billing_reference ON public.billing_documents(reference);
CREATE INDEX idx_billing_client ON public.billing_documents(client_name);
CREATE INDEX idx_billing_due ON public.billing_documents(due_date) WHERE status IN ('envoye','accepte');

-- ============================================================
-- TABLE 13: BILLING_LINES (document line items)
-- ============================================================
CREATE TABLE public.billing_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES public.billing_documents(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        NUMERIC(12,2) NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'kg',
  unit_price      NUMERIC(12,4) NOT NULL,
  tva_rate        NUMERIC(5,2) NOT NULL DEFAULT 8.5,
  total_ht       NUMERIC(12,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  total_ttc      NUMERIC(12,2) NOT NULL GENERATED ALWAYS AS (ROUND((quantity * unit_price) * (1 + tva_rate / 100), 2)) STORED,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_lines_doc ON public.billing_lines(document_id);

-- ============================================================
-- TABLE 14: QONTO_TRANSACTIONS (simulated/real pro account)
-- ============================================================
CREATE TABLE public.qonto_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date                TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount              NUMERIC(12,2) NOT NULL,
  description         TEXT NOT NULL,
  category            qonto_tx_category NOT NULL DEFAULT 'autre',
  status              qonto_tx_status NOT NULL DEFAULT 'pending',
  linked_document_id  UUID REFERENCES public.billing_documents(id) ON DELETE SET NULL,
  qonto_id            TEXT,
  reconciliation_status TEXT DEFAULT 'non_rapprochee',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qonto_owner ON public.qonto_transactions(owner_id);
CREATE INDEX idx_qonto_date ON public.qonto_transactions(date DESC);
CREATE INDEX idx_qonto_category ON public.qonto_transactions(category);

-- ============================================================
-- TABLE 15: SUBSCRIPTIONS (memberships)
-- ============================================================
CREATE TABLE public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name       TEXT NOT NULL,
  plan            plan_type NOT NULL DEFAULT 'gratuit',
  status          sub_status NOT NULL DEFAULT 'en_attente',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL,
  auto_renew      BOOLEAN NOT NULL DEFAULT true,
  payment_method  payment_method NOT NULL DEFAULT 'virement',
  amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  reference       TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subs_user ON public.subscriptions(user_id);
CREATE INDEX idx_subs_status ON public.subscriptions(status);
CREATE INDEX idx_subs_plan ON public.subscriptions(plan);
CREATE INDEX idx_subs_expires ON public.subscriptions(expires_at);

-- ============================================================
-- TABLE 16: COMMISSIONS
-- ============================================================
CREATE TABLE public.commissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id   UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  rfq_id            UUID REFERENCES public.rfq(id) ON DELETE SET NULL,
  amount            NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate   NUMERIC(5,2) NOT NULL DEFAULT 5,
  status            commission_status NOT NULL DEFAULT 'en_attente',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at           TIMESTAMPTZ
);

CREATE INDEX idx_comms_sub ON public.commissions(subscription_id);
CREATE INDEX idx_comms_status ON public.commissions(status);

-- ============================================================
-- TABLE 17: NOTIFICATIONS (centralized log)
-- ============================================================
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel       notif_channel NOT NULL,
  status        notif_status NOT NULL DEFAULT 'en_attente',
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  action_url    TEXT,
  metadata      JSONB DEFAULT '{}',
  sent_at       TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user ON public.notifications(user_id);
CREATE INDEX idx_notif_status ON public.notifications(status);
CREATE INDEX idx_notif_unread ON public.notifications(user_id) WHERE read_at IS NULL;

-- ============================================================
-- TABLE 18: PRICE_REFERENCES (Martinique price grid)
-- ============================================================
CREATE TABLE public.price_references (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product       TEXT NOT NULL UNIQUE,
  min_price     NUMERIC(8,2) NOT NULL,
  max_price     NUMERIC(8,2) NOT NULL,
  unit          TEXT NOT NULL DEFAULT 'kg',
  delivery_days INTEGER NOT NULL DEFAULT 2,
  source        TEXT DEFAULT 'marché_local',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE 19: AUDIT_LOG (bankable traceability)
-- ============================================================
CREATE TABLE public.audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  table_name    TEXT NOT NULL,
  record_id     UUID,
  old_data      JSONB,
  new_data      JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_date ON public.audit_log(created_at DESC);

-- ============================================================
-- TABLE 20: DOCUMENT_COUNTERS (reference sequences)
-- ============================================================
CREATE TABLE public.document_counters (
  type          doc_type PRIMARY KEY,
  year          INTEGER NOT NULL DEFAULT date_part('year', now()),
  last_number   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(type, year)
);

-- Seed counters
INSERT INTO public.document_counters (type, year, last_number) VALUES
  ('devis', 2026, 0),
  ('facture', 2026, 0),
  ('bon_commande', 2026, 0)
ON CONFLICT (type) DO NOTHING;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- 1) auto_update_updated_at()
CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
    GROUP BY table_name
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.auto_update_updated_at()',
      t.table_name
    );
  END LOOP;
END $$;

-- 2) next_document_reference(type) — atomic sequence
CREATE OR REPLACE FUNCTION public.next_document_reference(doc_type doc_type)
RETURNS TEXT AS $$
DECLARE
  v_year INTEGER := date_part('year', now());
  v_num INTEGER;
  v_prefix TEXT;
  v_ref TEXT;
BEGIN
  v_prefix := CASE doc_type
    WHEN 'devis' THEN 'DEV'
    WHEN 'facture' THEN 'FAC'
    WHEN 'bon_commande' THEN 'BC'
  END;

  UPDATE public.document_counters
  SET last_number = last_number + 1
  WHERE type = doc_type AND year = v_year
  RETURNING last_number INTO v_num;

  IF NOT FOUND THEN
    INSERT INTO public.document_counters (type, year, last_number)
    VALUES (doc_type, v_year, 1)
    RETURNING last_number INTO v_num;
  END IF;

  v_ref := v_prefix || '-' || v_year || '-' || lpad(v_num::text, 4, '0');
  RETURN v_ref;
END;
$$ LANGUAGE plpgsql;

-- 3) handle_new_user() — auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, commune, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'producteur')::user_role,
    NEW.raw_user_meta_data->>'commune',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) auto_create_commission() — commission on confirmed RFQ
CREATE OR REPLACE FUNCTION public.auto_create_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_sub_id UUID;
  v_plan plan_type;
  v_rate NUMERIC(5,2);
BEGIN
  IF NEW.status = 'confirmee' AND (OLD.status IS NULL OR OLD.status != 'confirmee') THEN
    SELECT owner_id INTO v_user_id FROM public.rfq WHERE id = NEW.id;

    SELECT s.id, s.plan INTO v_sub_id, v_plan
    FROM public.subscriptions s
    WHERE s.user_id = v_user_id AND s.status = 'active'
    ORDER BY s.created_at DESC LIMIT 1;

    v_rate := CASE v_plan
      WHEN 'plantasyon' THEN 2
      WHEN 'lakou' THEN 3
      WHEN 'konbit' THEN 5
      ELSE 8  -- gratuit
    END;

    INSERT INTO public.commissions (subscription_id, rfq_id, amount, commission_rate, status)
    VALUES (
      COALESCE(v_sub_id, '00000000-0000-0000-0000-000000000000'),
      NEW.id,
      COALESCE(NEW.budget_max, 0) * v_rate / 100,
      v_rate,
      'en_attente'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rfq_confirmed
  AFTER UPDATE ON public.rfq
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_commission();

-- 5) auto_mark_payment() — when invoice marked paid → sync Qonto
CREATE OR REPLACE FUNCTION public.auto_mark_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paye' AND (OLD.status IS NULL OR OLD.status != 'paye') THEN
    NEW.payment_status := 'paye';
    NEW.paid_at := COALESCE(NEW.paid_at, now());
    NEW.qonto_synced := true;

    INSERT INTO public.qonto_transactions (owner_id, date, amount, description, category, status, linked_document_id)
    VALUES (
      NEW.owner_id,
      now(),
      NEW.total_ttc,
      'Paiement ' || NEW.reference || ' — ' || NEW.client_name,
      'vente',
      'completed',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_document_paid
  BEFORE UPDATE ON public.billing_documents
  FOR EACH ROW EXECUTE FUNCTION public.auto_mark_payment();

-- 6) auto_notify_rfq() — notification when RFQ is sent
CREATE OR REPLACE FUNCTION public.auto_notify_rfq()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'envoyee' AND (OLD.status IS NULL OR OLD.status = 'brouillon') THEN
    INSERT INTO public.notifications (user_id, channel, title, body, action_url)
    SELECT
      p.id,
      'whatsapp'::notif_channel,
      'Appel d''offre envoyé',
      'Votre appel d''offre "' || NEW.title || '" a été envoyé à ' || COUNT(rp.id)::text || ' partenaires.',
      '/appels-offre/' || NEW.id::text
    FROM public.rfq_partners rp
    JOIN public.profiles p ON p.id = NEW.owner_id
    WHERE rp.rfq_id = NEW.id
    GROUP BY p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rfq_sent
  AFTER UPDATE ON public.rfq
  FOR EACH ROW EXECUTE FUNCTION public.auto_notify_rfq();

-- 7) audit_trigger_func() — log all critical modifications
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.owner_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.owner_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit on critical tables (billing + subscriptions)
DO $$
BEGIN
  CREATE TRIGGER audit_billing AFTER INSERT OR UPDATE OR DELETE ON public.billing_documents
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  CREATE TRIGGER audit_subs AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  CREATE TRIGGER audit_qonto AFTER INSERT OR UPDATE OR DELETE ON public.qonto_transactions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
  CREATE TRIGGER audit_rfq AFTER INSERT OR UPDATE OR DELETE ON public.rfq
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
EXCEPTION WHEN others THEN NULL;
END $$;

-- ============================================================
-- RLS — ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on ALL 20 tables
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

-- ===== PROFILES =====
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Public read active profiles" ON public.profiles
  FOR SELECT USING (active = true);

-- ===== PRODUCTEURS =====
CREATE POLICY "Owners CRUD own producteurs" ON public.producteurs
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all producteurs" ON public.producteurs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active producteurs visible" ON public.producteurs
  FOR SELECT USING (active = true);

-- ===== LOGISTICS =====
CREATE POLICY "Owners CRUD own logistics" ON public.logistics_providers
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all logistics" ON public.logistics_providers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active logistics visible" ON public.logistics_providers
  FOR SELECT USING (active = true);

-- ===== DISTRIBUTORS =====
CREATE POLICY "Owners CRUD own distributors" ON public.distributors
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all distributors" ON public.distributors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active distributors visible" ON public.distributors
  FOR SELECT USING (active = true);

-- ===== PARCELLES =====
CREATE POLICY "Owners CRUD own parcelles" ON public.parcelles
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins read all parcelles" ON public.parcelles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== RESOURCES =====
CREATE POLICY "Owners CRUD own resources" ON public.resources
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all resources" ON public.resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active resources visible" ON public.resources
  FOR SELECT USING (active = true);

-- ===== BOOKINGS =====
CREATE POLICY "Authenticated users manage bookings" ON public.bookings
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Active bookings visible" ON public.bookings
  FOR SELECT USING (active = true);

-- ===== LOTS =====
CREATE POLICY "Owners CRUD own lots" ON public.lots
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all lots" ON public.lots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active lots visible" ON public.lots
  FOR SELECT USING (active = true);

-- ===== ORDERS =====
CREATE POLICY "Owners CRUD own orders" ON public.orders
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins CRUD all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
CREATE POLICY "Active orders visible" ON public.orders
  FOR SELECT USING (active = true);

-- ===== RFQ =====
CREATE POLICY "Owners CRUD own rfq" ON public.rfq
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Partners read own rfq" ON public.rfq
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.rfq_partners rp WHERE rp.rfq_id = id AND rp.partner_id = auth.uid())
  );

-- ===== RFQ_PARTNERS =====
CREATE POLICY "RFQ owners manage partners" ON public.rfq_partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.rfq r WHERE r.id = rfq_id AND r.owner_id = auth.uid())
  );
CREATE POLICY "Partners read own entry" ON public.rfq_partners
  FOR SELECT USING (partner_id = auth.uid());
CREATE POLICY "Partners update own status" ON public.rfq_partners
  FOR UPDATE USING (partner_id = auth.uid());

-- ===== BILLING_DOCUMENTS =====
CREATE POLICY "Owners CRUD own docs" ON public.billing_documents
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins read all docs" ON public.billing_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== BILLING_LINES =====
CREATE POLICY "Doc owners read lines" ON public.billing_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.billing_documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
  );
CREATE POLICY "Doc owners manage lines" ON public.billing_lines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.billing_documents d WHERE d.id = document_id AND d.owner_id = auth.uid())
  );

-- ===== QONTO =====
CREATE POLICY "Owners CRUD own qonto" ON public.qonto_transactions
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins read all qonto" ON public.qonto_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== SUBSCRIPTIONS =====
CREATE POLICY "Users read own subs" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins CRUD all subs" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== COMMISSIONS =====
CREATE POLICY "Users read own commissions" ON public.commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Admins CRUD all commissions" ON public.commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== NOTIFICATIONS =====
CREATE POLICY "Users read own notifs" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifs" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ===== PRICE_REFERENCES =====
CREATE POLICY "Price refs public read" ON public.price_references
  FOR SELECT USING (true);
CREATE POLICY "Admins manage price refs" ON public.price_references
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== AUDIT_LOG =====
CREATE POLICY "Admins read audit" ON public.audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );

-- ===== DOCUMENT_COUNTERS =====
CREATE POLICY "System uses counters" ON public.document_counters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ============================================================
-- VIEWS
-- ============================================================

-- billing_summary — financial summary per user
CREATE OR REPLACE VIEW public.billing_summary AS
SELECT
  bd.owner_id,
  COUNT(*) FILTER (WHERE bd.type = 'devis') AS nb_devis,
  COUNT(*) FILTER (WHERE bd.type = 'facture') AS nb_factures,
  COUNT(*) FILTER (WHERE bd.type = 'bon_commande') AS nb_bc,
  COALESCE(SUM(bd.total_ttc) FILTER (WHERE bd.payment_status = 'paye'), 0) AS total_paye,
  COALESCE(SUM(bd.total_ttc) FILTER (WHERE bd.payment_status = 'non_paye' AND bd.status IN ('envoye','accepte')), 0) AS total_en_attente,
  COALESCE(SUM(bd.total_ttc) FILTER (WHERE bd.payment_status = 'en_retard'), 0) AS total_en_retard
FROM public.billing_documents bd
GROUP BY bd.owner_id;

-- qonto_balance — current balance per user
CREATE OR REPLACE VIEW public.qonto_balance AS
SELECT
  qt.owner_id,
  COALESCE(SUM(qt.amount) FILTER (WHERE qt.amount > 0 AND qt.status = 'completed'), 0) AS total_revenus,
  COALESCE(ABS(SUM(qt.amount)) FILTER (WHERE qt.amount < 0 AND qt.status = 'completed'), 0) AS total_depenses,
  COALESCE(SUM(qt.amount) FILTER (WHERE qt.status = 'completed'), 0) AS solde
FROM public.qonto_transactions qt
GROUP BY qt.owner_id;

-- active_members_geo — all active members with coordinates
CREATE OR REPLACE VIEW public.active_members_geo AS
SELECT id, full_name AS name, role AS type, commune, phone, latitude AS lat, longitude AS lng, ''::text[] AS specialites, NULL::double precision AS superficie_ha
FROM public.profiles WHERE active = true AND latitude IS NOT NULL
UNION ALL
SELECT id, name, 'producteur'::text AS type, commune, phone, geo_lat, geo_lng, cultures AS specialites, superficie_ha
FROM public.producteurs WHERE active = true AND geo_lat IS NOT NULL
UNION ALL
SELECT id, name, 'transporteur'::text AS type, commune, phone, geo_lat, geo_lng, services AS specialites, NULL::double precision
FROM public.logistics_providers WHERE active = true AND geo_lat IS NOT NULL
UNION ALL
SELECT id, name, type, commune, phone, geo_lat, geo_lng, ARRAY[]::text[] AS specialites, NULL::double precision
FROM public.distributors WHERE active = true AND geo_lat IS NOT NULL;

-- ============================================================
-- CRON JOBS — Set up via Dashboard → Cron (pg_cron not available from SQL)
-- ============================================================
--
-- The following 3 scheduled jobs MUST be configured via the
-- Supabase Dashboard → Database → Cron (pg_cron extension must
-- be enabled first in Dashboard → Extensions).
--
-- ┌─────────────────────────────────────────────────────────┐
-- │ Job 1: mark-overdue-invoices                            │
-- │ Schedule: 0 6 * * *  (daily at 6:00 AM UTC)            │
-- │ SQL:                                                   │
-- │   UPDATE public.billing_documents                      │
-- │   SET payment_status = 'en_retard'                     │
-- │   WHERE payment_status = 'non_paye'                    │
-- │     AND due_date < CURRENT_DATE                        │
-- │     AND status IN ('envoye', 'accepte');               │
-- └─────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────┐
-- │ Job 2: notify-overdue-invoices                         │
-- │ Schedule: 5 6 * * *  (daily at 6:05 AM UTC)            │
-- │ SQL:                                                   │
-- │   INSERT INTO public.notifications                     │
-- │     (user_id, channel, title, body, action_url)        │
-- │   SELECT                                               │
-- │     bd.owner_id,                                       │
-- │     'email'::notif_channel,                            │
-- │     'Facture en retard',                               │
-- │     'La facture ' || bd.reference || ' (' ||          │
-- │       bd.total_ttc || '€) pour ' || bd.client_name ||  │
-- │       ' est en retard depuis le ' || bd.due_date::text,│
-- │     '/facturation'                                     │
-- │   FROM public.billing_documents bd                     │
-- │   WHERE bd.payment_status = 'en_retard'                │
-- │     AND NOT EXISTS (                                   │
-- │       SELECT 1 FROM public.notifications n             │
-- │       WHERE n.user_id = bd.owner_id                    │
-- │         AND n.title = 'Facture en retard'              │
-- │         AND n.body LIKE '%' || bd.reference || '%'     │
-- │         AND n.created_at > now() - interval '3 days'   │
-- │     );                                                 │
-- └─────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────┐
-- │ Job 3: check-expired-subscriptions                     │
-- │ Schedule: 0 7 1 * *  (monthly on 1st at 7:00 AM UTC)   │
-- │ SQL:                                                   │
-- │   UPDATE public.subscriptions                          │
-- │   SET status = 'expiree'                               │
-- │   WHERE status = 'active' AND expires_at < now();      │
-- │                                                        │
-- │   INSERT INTO public.notifications                     │
-- │     (user_id, channel, title, body, action_url)        │
-- │   SELECT                                               │
-- │     s.user_id,                                         │
-- │     'email'::notif_channel,                            │
-- │     'Abonnement expiré',                               │
-- │     'Votre abonnement ' || s.plan::text ||             │
-- │       ' KopéAgri a expiré. Renouvelez-le.',           │
-- │     '/adhesion'                                        │
-- │   FROM public.subscriptions s                         │
-- │   WHERE s.status = 'expiree' AND s.auto_renew = true;  │
-- └─────────────────────────────────────────────────────────┘

-- ============================================================
-- RPC FUNCTIONS (callable from client)
-- ============================================================

-- get_document_ref: called from client for unique reference
CREATE OR REPLACE FUNCTION public.get_document_ref(p_type doc_type)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT public.next_document_reference(p_type);
$$;

-- get_dashboard_stats: dashboard stats for current user
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'nb_producteurs', (SELECT COUNT(*) FROM public.producteurs WHERE owner_id = auth.uid() AND active = true),
    'nb_transporteurs', (SELECT COUNT(*) FROM public.logistics_providers WHERE owner_id = auth.uid() AND active = true),
    'nb_distributeurs', (SELECT COUNT(*) FROM public.distributors WHERE owner_id = auth.uid() AND active = true),
    'nb_rfq_actifs', (SELECT COUNT(*) FROM public.rfq WHERE owner_id = auth.uid() AND status IN ('envoyee','confirmee','en_cours')),
    'nb_devis', (SELECT COUNT(*) FROM public.billing_documents WHERE owner_id = auth.uid() AND type = 'devis'),
    'nb_factures', (SELECT COUNT(*) FROM public.billing_documents WHERE owner_id = auth.uid() AND type = 'facture'),
    'total_en_attente', (SELECT COALESCE(SUM(total_ttc), 0) FROM public.billing_documents WHERE owner_id = auth.uid() AND payment_status = 'non_paye'),
    'solde_qonto', (SELECT COALESCE(SUM(amount), 0) FROM public.qonto_transactions WHERE owner_id = auth.uid() AND status = 'completed'),
    'abonnement', (SELECT plan::text FROM public.subscriptions WHERE user_id = auth.uid() AND status = 'active' ORDER BY created_at DESC LIMIT 1)
  );
$$;

-- ============================================================
-- SEED DATA — Demo data (inserted only if table is empty)
-- ============================================================

-- PRICE REFERENCES — Martinique market prices
INSERT INTO public.price_references (product, min_price, max_price, unit, delivery_days, source)
SELECT *
FROM (VALUES
  ('banane'::text, 0.80, 1.50, 'kg'::text, 2, 'marché_local'::text),
  ('banane plantain', 1.00, 2.00, 'kg', 2, 'marché_local'),
  ('mangue', 2.00, 5.00, 'kg', 1, 'marché_local'),
  ('ananas', 1.50, 3.50, 'pièce', 2, 'marché_local'),
  ('fruit à pain', 1.00, 2.50, 'kg', 1, 'marché_local'),
  ('igname', 1.50, 3.00, 'kg', 3, 'marché_local'),
  ('dachine', 1.50, 3.00, 'kg', 3, 'marché_local'),
  ('canne à sucre', 0.30, 0.60, 'kg', 2, 'marché_local'),
  ('cacao', 5.00, 9.00, 'kg', 7, 'marché_local'),
  ('café', 15.00, 28.00, 'kg', 7, 'marché_local'),
  ('vanille', 150.00, 350.00, 'gousse', 14, 'marché_local'),
  ('piment', 8.00, 18.00, 'kg', 2, 'marché_local'),
  ('christophine', 1.00, 2.00, 'kg', 2, 'marché_local'),
  ('giraumon', 1.00, 2.50, 'kg', 2, 'marché_local'),
  ('patate douce', 1.20, 2.50, 'kg', 3, 'marché_local'),
  ('malanga', 2.00, 4.00, 'kg', 3, 'marché_local'),
  ('madère', 1.50, 3.00, 'kg', 3, 'marché_local'),
  ('avocat', 2.00, 5.00, 'kg', 1, 'marché_local'),
  ('citron', 2.00, 4.00, 'kg', 1, 'marché_local'),
  ('pamplemousse', 1.50, 3.00, 'kg', 1, 'marché_local'),
  ('corossol', 3.00, 6.00, 'kg', 2, 'marché_local'),
  ('goyave', 2.00, 4.00, 'kg', 1, 'marché_local'),
  ('laitue', 1.50, 3.00, 'unité', 1, 'marché_local'),
  ('tomate', 2.00, 4.50, 'kg', 1, 'marché_local'),
  ('concombre', 1.50, 3.00, 'kg', 1, 'marché_local'),
  ('aubergine', 2.00, 4.00, 'kg', 2, 'marché_local'),
  ('transport martinique', 0.50, 1.20, 'km', 0, 'transport')
) AS v(product, min_price, max_price, unit, delivery_days, source)
WHERE NOT EXISTS (SELECT 1 FROM public.price_references LIMIT 1)
ON CONFLICT (product) DO NOTHING;

-- RESOURCES — Demo shared resources
INSERT INTO public.resources (id, name, type, owner_name, commune, rate, unit, quantity, description, available, active)
SELECT *
FROM (VALUES
  ('a7e1b2c3-0001-4000-8000-000000000001'::uuid, 'Tracteur Massey Ferguson 285'::text, 'materiel'::resource_type, 'Coopérative Nord'::text, 'Sainte-Marie'::text, 120.00, 'jour'::text, 1, 'Tracteur 80CV avec relevage, prise de force, parfait pour labour et transport de charges.'::text, true, true),
  ('a7e1b2c3-0001-4000-8000-000000000002'::uuid, 'Chambre froide 20m³', 'chambre_froide', 'SCEA Galbas', 'Le Lamentin', 80.00, 'jour', 1, 'Chambre froide positive 4°C, idéale pour fruits et légumes. Capacité 5 palettes.', true, true),
  ('a7e1b2c3-0001-4000-8000-000000000003'::uuid, 'Camion frigorifique 3.5T', 'camion', 'Transports Férand', 'Ducos', 200.00, 'jour', 1, 'Camion frigorifique avec hayon, collecte multi-points, tournée Nord/Sud possible.', true, true),
  ('a7e1b2c3-0001-4000-8000-000000000004'::uuid, 'Équipe récolte (3 pers.)', 'main_oeuvre', 'Jean-Marie Larcher', 'Le Morne-Rouge', 250.00, 'équipe/jour', 2, 'Équipe expérimentée pour récolte bananes, mangues, fruits tropicaux. 3 personnes.', true, true),
  ('a7e1b2c3-0001-4000-8000-000000000005'::uuid, 'Engrais bio certifié', 'intrant', 'Coopérative Nord', 'Saint-Pierre', 35.00, 'kg', 250, 'Engrais organique NPK 4-6-8, certifié bio, idéal pour maraîchage et vergers.', true, true),
  ('a7e1b2c3-0001-4000-8000-000000000006'::uuid, 'Caisse plastique réutilisable', 'emballage', 'Coopérative Nord', 'Fort-de-France', 2.00, 'pièce', 500, 'Caisses plastiques empilables 40x30x25cm, lavées et désinfectées. Lot de 50 minimum.', true, true),
  ('a7e1b2c3-0001-4000-8000-000000000007'::uuid, 'Broyeur végétaux', 'materiel', 'EARL Larcher', 'Le Morne-Rouge', 60.00, 'jour', 1, 'Broyeur thermique 15CV, idéal pour paillage et compost.', false, true)
) AS v(id, name, type, owner_name, commune, rate, unit, quantity, description, available, active)
WHERE NOT EXISTS (SELECT 1 FROM public.resources LIMIT 1);

-- LOTS — Demo product lots
INSERT INTO public.lots (id, product, commune, qty, unit, price_per_unit, quality, available_date, status, certifications, image_url, active)
SELECT *
FROM (VALUES
  ('b8f2c3d4-0001-4000-8000-000000000001'::uuid, 'Banane Cavendish'::text, 'Le Morne-Rouge'::text, 500.00, 'kg'::text, 2.50, 'Extra'::text, '2026-07-15'::text, 'approved'::lot_status, ARRAY['Bio','Commerce équitable']::text[], '🍌'::text, true),
  ('b8f2c3d4-0001-4000-8000-000000000002'::uuid, 'Mangue José', 'Saint-Pierre', 200.00, 'kg', 4.00, 'Premium', '2026-07-10', 'approved', ARRAY['Bio'], '🥭', true),
  ('b8f2c3d4-0001-4000-8000-000000000003'::uuid, 'Avocat Haas', 'Le François', 300.00, 'kg', 3.80, 'Extra', '2026-07-20', 'pending', ARRAY['Bio','HVE'], '🥑', true),
  ('b8f2c3d4-0001-4000-8000-000000000004'::uuid, 'Ananas Victoria', 'Sainte-Luce', 150.00, 'pièce', 3.00, 'Premium', '2026-07-25', 'approved', ARRAY['Bio'], '🍍', true),
  ('b8f2c3d4-0001-4000-8000-000000000005'::uuid, 'Patate douce', 'Ajoupa-Bouillon', 800.00, 'kg', 1.80, 'Standard', '2026-07-18', 'approved', ARRAY[]::text[], '🍠', true),
  ('b8f2c3d4-0001-4000-8000-000000000006'::uuid, 'Citron vert', 'Le Morne-Rouge', 100.00, 'kg', 3.50, 'Extra', '2026-07-12', 'sold', ARRAY[]::text[], '🍋', true),
  ('b8f2c3d4-0001-4000-8000-000000000007'::uuid, 'Giraumon', 'Le Robert', 400.00, 'kg', 2.00, 'Standard', '2026-07-22', 'draft', ARRAY[]::text[], '🎃', true)
) AS v(id, product, commune, qty, unit, price_per_unit, quality, available_date, status, certifications, image_url, active)
WHERE NOT EXISTS (SELECT 1 FROM public.lots LIMIT 1);

-- ORDERS — Demo purchase orders
INSERT INTO public.orders (id, ref, buyer_name, items, total, commission, status, order_date, delivery_info, active)
SELECT *
FROM (VALUES
  ('c9d3e4f5-0001-4000-8000-000000000001'::uuid, 'CMD-001'::text, 'Hôtel Bakoua - Les Trois-Îlets'::text, '[{"product":"Banane Cavendish","qty":200,"unit":"kg","price":2.5}]'::jsonb, 500.00, 25.00, 'preparing'::order_status, '2026-07-10'::date, 'Livraison hôtel'::text, true),
  ('c9d3e4f5-0001-4000-8000-000000000002'::uuid, 'CMD-002', 'Marché Fort-de-France', '[{"product":"Mangue José","qty":100,"unit":"kg","price":4.0},{"product":"Avocat Haas","qty":50,"unit":"kg","price":3.8}]', 590.00, 29.50, 'approved', '2026-07-12', 'Point relais Dillon', true),
  ('c9d3e4f5-0001-4000-8000-000000000003'::uuid, 'CMD-003', 'Restaurant Le Petibonum', '[{"product":"Ananas Victoria","qty":60,"unit":"pièce","price":3.0},{"product":"Citron vert","qty":20,"unit":"kg","price":3.5}]', 250.00, 12.50, 'delivered', '2026-07-05', 'Livraison restaurant', true),
  ('c9d3e4f5-0001-4000-8000-000000000004'::uuid, 'CMD-004', 'Export Guadeloupe', '[{"product":"Banane Cavendish","qty":1000,"unit":"kg","price":2.2}]', 2200.00, 110.00, 'pending', '2026-07-20', 'Port de Fort-de-France', true),
  ('c9d3e4f5-0001-4000-8000-000000000005'::uuid, 'CMD-005', 'Épicerie Croix-Rivail', '[{"product":"Patate douce","qty":50,"unit":"kg","price":1.8},{"product":"Giraumon","qty":30,"unit":"kg","price":2.0}]', 150.00, 7.50, 'cancelled', '2026-07-08', 'Magasin', true)
) AS v(id, ref, buyer_name, items, total, commission, status, order_date, delivery_info, active)
WHERE NOT EXISTS (SELECT 1 FROM public.orders LIMIT 1);

-- ============================================================
-- STORAGE BUCKETS (create via Dashboard → Storage)
-- ============================================================
-- Bucket: photos      — product/parcel images  (public: false, MIME: image/*)
-- Bucket: avatars     — profile photos
-- Bucket: documents   — invoice/quote PDFs (private)
-- Bucket: parcelles   — plot/satellite photos

-- ============================================================
-- END OF PRODUCTION SQL SCRIPT
-- ============================================================
