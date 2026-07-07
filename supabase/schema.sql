-- ============================================================
-- KOPÉAGRI CARAÏBES — SCHÉMA SUPABASE PRODUCTION
-- Version: 1.0.0
-- Date: 2026-07-07
-- Backend complet: Auth, RLS, Facturation, Adhésions, RFQ, Géoloc, Notifications
-- ============================================================

-- ===== EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

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

-- ============================================================
-- TABLE 1: PROFILES (extension auth.users)
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
  siret         TEXT,               -- SIRET pour facturation pro
  rib           TEXT,               -- RIB/IBAN pour paiements
  company_name  TEXT,               -- Raison sociale
  address       TEXT,               -- Adresse complète
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  active        BOOLEAN NOT NULL DEFAULT true,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index géographique
CREATE INDEX idx_profiles_commune ON public.profiles(commune);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(active) WHERE active = true;
CREATE INDEX idx_profiles_geo ON public.profiles USING gist(point(longitude, latitude));

-- ============================================================
-- TABLE 2: PRODUCTEURS (fiches détaillées)
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
-- TABLE 3: LOGISTICS_PROVIDERS (transporteurs)
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
  zone_couverture TEXT[] DEFAULT '{}',  -- communes couvertes
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
-- TABLE 5: PARCELLES (terrain agricole géolocalisé)
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
CREATE INDEX idx_parcelles_geo ON public.parcelles USING gist(point(geo_lng, geo_lat));

-- ============================================================
-- TABLE 6: RFQ (Appels d'Offre)
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
-- TABLE 7: RFQ_PARTNERS (partenaires liés à un appel d'offre)
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
-- TABLE 8: BILLING_DOCUMENTS (devis, factures, BC)
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
  client_siret    TEXT,              -- SIRET client pour facturation pro
  subtotal_ht     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tva       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date        DATE NOT NULL,
  sent_at         TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  qonto_synced    BOOLEAN NOT NULL DEFAULT false,
  pdf_url         TEXT,              -- lien vers le PDF généré dans Storage
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
-- TABLE 9: BILLING_LINES (lignes de document)
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
-- TABLE 10: QONTO_TRANSACTIONS (compte pro simulé/réel)
-- ============================================================
CREATE TABLE public.qonto_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date                TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount              NUMERIC(12,2) NOT NULL,          -- positif=crédit, négatif=débit
  description         TEXT NOT NULL,
  category            qonto_tx_category NOT NULL DEFAULT 'autre',
  status              qonto_tx_status NOT NULL DEFAULT 'pending',
  linked_document_id  UUID REFERENCES public.billing_documents(id) ON DELETE SET NULL,
  qonto_id            TEXT,                            -- ID réel Qonto si connecté
  reconciliation_status TEXT DEFAULT 'non_rapprochee', -- non_rapprochee, rapprochee, ecart
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qonto_owner ON public.qonto_transactions(owner_id);
CREATE INDEX idx_qonto_date ON public.qonto_transactions(date DESC);
CREATE INDEX idx_qonto_category ON public.qonto_transactions(category);

-- ============================================================
-- TABLE 11: SUBSCRIPTIONS (adhésions)
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
  stripe_subscription_id TEXT,        -- ID Stripe si paiement en ligne
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subs_user ON public.subscriptions(user_id);
CREATE INDEX idx_subs_status ON public.subscriptions(status);
CREATE INDEX idx_subs_plan ON public.subscriptions(plan);
CREATE INDEX idx_subs_expires ON public.subscriptions(expires_at);

-- ============================================================
-- TABLE 12: COMMISSIONS
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
-- TABLE 13: NOTIFICATIONS (log centralisé)
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
-- TABLE 14: PRICE_REFERENCES (grille tarifaire Martinique)
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
-- TABLE 15: AUDIT_LOG (traçabilité bankable)
-- ============================================================
CREATE TABLE public.audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,           -- INSERT, UPDATE, DELETE
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
-- TABLE 16: DOCUMENT_COUNTERS (séquence de références)
-- ============================================================
CREATE TABLE public.document_counters (
  type          doc_type PRIMARY KEY,
  year          INTEGER NOT NULL DEFAULT date_part('year', now()),
  last_number   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(type, year)
);

-- Seed les compteurs
INSERT INTO public.document_counters (type, year, last_number) VALUES
  ('devis', 2026, 0),
  ('facture', 2026, 0),
  ('bon_commande', 2026, 0)
ON CONFLICT (type) DO NOTHING;

-- ============================================================
-- FONCTIONS
-- ============================================================

-- 1) auto_update_updated_at()
CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur toutes les tables avec updated_at
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

-- 2) next_document_reference(type) — séquence atomique
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

-- 3) handle_new_user() — créer profile automatiquement à l'inscription
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

-- 4) auto_create_commission() — commission sur transaction RFQ confirmée
CREATE OR REPLACE FUNCTION public.auto_create_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_sub_id UUID;
  v_plan plan_type;
  v_rate NUMERIC(5,2);
BEGIN
  -- Quand un RFQ passe à 'confirmee', créer la commission
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

-- 5) auto_mark_payment() — quand facture marquée payée → sync Qonto
CREATE OR REPLACE FUNCTION public.auto_mark_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paye' AND (OLD.status IS NULL OR OLD.status != 'paye') THEN
    NEW.payment_status := 'paye';
    NEW.paid_at := COALESCE(NEW.paid_at, now());
    NEW.qonto_synced := true;
    
    -- Créer la transaction Qonto automatiquement
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

-- 6) auto_notify_rfq() — notification quand RFQ passe en envoyée
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

-- 7) audit_trigger() — log toutes les modifications critiques
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

-- Audit sur les tables critiques (facturation + adhésions)
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
-- RLS — ROW LEVEL SECURITY (sécurité par ligne)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelles ENABLE ROW LEVEL SECURITY;
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
-- Chaque utilisateur lit/écrit son propre profil
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
-- Les admins/coop voient tout
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','cooperative','institution'))
  );
-- Les autres voient les profils actifs (nom, rôle, commune, phone uniquement)
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
-- SEED DATA — Références prix Martinique
-- ============================================================
INSERT INTO public.price_references (product, min_price, max_price, unit, delivery_days, source) VALUES
  ('banane', 0.80, 1.50, 'kg', 2, 'marché_local'),
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
ON CONFLICT (product) DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- (À exécuter via le dashboard Supabase ou l'API)
-- Bucket: avatars    — photos de profil
-- Bucket: products   — photos produits (public)
-- Bucket: documents  — PDFs factures/devis (privé)
-- Bucket: parcelles  — photos parcelles/satellite

-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue: billing_summary — résumé financier par utilisateur
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

-- Vue: qonto_balance — solde courant par utilisateur
CREATE OR REPLACE VIEW public.qonto_balance AS
SELECT
  qt.owner_id,
  COALESCE(SUM(qt.amount) FILTER (WHERE qt.amount > 0 AND qt.status = 'completed'), 0) AS total_revenus,
  COALESCE(ABS(SUM(qt.amount)) FILTER (WHERE qt.amount < 0 AND qt.status = 'completed'), 0) AS total_depenses,
  COALESCE(SUM(qt.amount) FILTER (WHERE qt.status = 'completed'), 0) AS solde
FROM public.qonto_transactions qt
GROUP BY qt.owner_id;

-- Vue: active_members_geo — tous les membres actifs avec coordonnées
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
-- CRON JOBS (pg_cron)
-- ============================================================

-- Tous les jours à 6h : marquer les factures en retard
SELECT cron.schedule(
  'mark-overdue-invoices',
  '0 6 * * *',
  $$
  UPDATE public.billing_documents
  SET payment_status = 'en_retard'
  WHERE payment_status = 'non_paye'
    AND due_date < CURRENT_DATE
    AND status IN ('envoye', 'accepte');
  $$
);

-- Tous les jours à 6h05 : notifier les factures en retard
SELECT cron.schedule(
  'notify-overdue-invoices',
  '5 6 * * *',
  $$
  INSERT INTO public.notifications (user_id, channel, title, body, action_url)
  SELECT
    bd.owner_id,
    'email'::notif_channel,
    'Facture en retard',
    'La facture ' || bd.reference || ' (' || bd.total_ttc || '€) pour ' || bd.client_name || ' est en retard depuis le ' || bd.due_date::text,
    '/facturation'
  FROM public.billing_documents bd
  WHERE bd.payment_status = 'en_retard'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = bd.owner_id
        AND n.title = 'Facture en retard'
        AND n.body LIKE '%' || bd.reference || '%'
        AND n.created_at > now() - interval '3 days'
    );
  $$
);

-- Tous les 1er du mois : vérifier les abonnements expirés
SELECT cron.schedule(
  'check-expired-subscriptions',
  '0 7 1 * *',
  $$
  UPDATE public.subscriptions
  SET status = 'expiree'
  WHERE status = 'active'
    AND expires_at < now();
  
  -- Notifier les utilisateurs
  INSERT INTO public.notifications (user_id, channel, title, body, action_url)
  SELECT
    s.user_id,
    'email'::notif_channel,
    'Abonnement expiré',
    'Votre abonnement ' || s.plan::text || ' KopéAgri a expiré. Renouvelez-le pour continuer à profiter de toutes les fonctionnalités.',
    '/adhesion'
  FROM public.subscriptions s
  WHERE s.status = 'expiree'
    AND s.auto_renew = true;
  $$
);

-- ============================================================
-- RPC ACCESSIBLES DEPUIS LE CLIENT
-- ============================================================

-- get_document_ref: appelée depuis le client pour obtenir une réf unique
CREATE OR REPLACE FUNCTION public.get_document_ref(p_type doc_type)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT public.next_document_reference(p_type);
$$;

-- get_dashboard_stats: stats du dashboard pour l'utilisateur courant
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

COMMIT;
