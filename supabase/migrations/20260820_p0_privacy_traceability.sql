-- KopéAgri P0 privacy + traceability baseline
-- IMPORTANT: run in Supabase SQL editor before production launch

-- 1) Stop exposing sensitive profile fields through base table policy
DROP POLICY IF EXISTS "Public read active profiles" ON public.profiles;

-- 2) Create safe public profile view (no phone/email/rib/address/siret)
CREATE OR REPLACE VIEW public.public_profiles_public AS
SELECT
  id,
  full_name,
  role,
  commune,
  avatar_url,
  bio,
  company_name,
  active,
  created_at
FROM public.profiles
WHERE active = true;

GRANT SELECT ON public.public_profiles_public TO anon, authenticated;

-- 2b) Extend lots table for unified agri/fishing traceability model
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS lot_code TEXT;
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('agriculture', 'pêche')) DEFAULT 'agriculture';
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS species_fao_code TEXT;
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS scientific_name TEXT;
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS harvest_or_capture_date DATE;
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS declared_origin TEXT;
ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS public_trace_level TEXT DEFAULT 'D0';

CREATE INDEX IF NOT EXISTS idx_lots_lot_code ON public.lots(lot_code);
CREATE INDEX IF NOT EXISTS idx_lots_trace_level ON public.lots(public_trace_level);

UPDATE public.lots
SET
  lot_code = COALESCE(lot_code, 'KPA-' || substring(replace(id::text, '-', '') from 1 for 10)),
  declared_origin = COALESCE(declared_origin, commune),
  harvest_or_capture_date = COALESCE(harvest_or_capture_date, NULLIF(available_date, '')::date)
WHERE lot_code IS NULL OR declared_origin IS NULL OR harvest_or_capture_date IS NULL;

CREATE TABLE IF NOT EXISTS public.trace_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_event_hash TEXT,
  event_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trace_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('private','buyer','public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trace_source_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result_status TEXT NOT NULL,
  result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trace_events_lot_id ON public.trace_events(lot_id);
CREATE INDEX IF NOT EXISTS idx_trace_documents_lot_id ON public.trace_documents(lot_id);
CREATE INDEX IF NOT EXISTS idx_trace_checks_lot_id ON public.trace_source_checks(lot_id);

ALTER TABLE public.trace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_source_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trace events owner/admin read" ON public.trace_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_events.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );

CREATE POLICY "Trace events owner/admin write" ON public.trace_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_events.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );

CREATE POLICY "Trace documents owner/admin read" ON public.trace_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_documents.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );

CREATE POLICY "Trace documents owner/admin write" ON public.trace_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_documents.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );

CREATE POLICY "Trace checks owner/admin read" ON public.trace_source_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_source_checks.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );

CREATE POLICY "Trace checks owner/admin write" ON public.trace_source_checks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lots l
      WHERE l.id = trace_source_checks.lot_id
      AND (
        l.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','gie','institution'))
      )
    )
  );
