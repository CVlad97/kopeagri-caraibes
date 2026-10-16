-- Additive extension of the existing Kopé Agri schema. No DELIKREOL table changes.
CREATE TABLE kopeagri.partner_reviewers(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE kopeagri.partner_reviewers ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA kopeagri,api TO authenticated;
GRANT SELECT ON kopeagri.partner_reviewers TO authenticated;
CREATE POLICY own_reviewer ON kopeagri.partner_reviewers FOR SELECT TO authenticated USING(user_id=(select auth.uid()));
INSERT INTO kopeagri.partner_reviewers(user_id) SELECT id FROM auth.users WHERE lower(email)='contactcvs@ikabay.store' AND email_confirmed_at IS NOT NULL ON CONFLICT DO NOTHING;
CREATE TABLE kopeagri.partner_applications(
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 reference uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
 full_name text NOT NULL DEFAULT '',phone text NOT NULL DEFAULT '',
 role text NOT NULL DEFAULT 'producteur' CHECK(role IN ('producteur','pecheur','acheteur_b2b','acheteur_b2c','transporteur','gie','institution','fournisseur')),
 company text NOT NULL DEFAULT '',registration_number text NOT NULL DEFAULT '',
 address text NOT NULL DEFAULT '',commune text NOT NULL DEFAULT '',territory text NOT NULL DEFAULT 'Martinique',
 activity text NOT NULL DEFAULT '',products jsonb NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(products)='array' AND jsonb_array_length(products)<=100),
 logistics jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(logistics)='object'),
 documents_pending_reason text NOT NULL DEFAULT '',
 consent_at timestamptz,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','needs_changes','approved','rejected')),
 review_note text NOT NULL DEFAULT '',reviewed_at timestamptz,reviewed_by uuid REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz
);
CREATE TABLE kopeagri.partner_documents(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES kopeagri.partner_applications(user_id) ON DELETE CASCADE,
 storage_path text NOT NULL UNIQUE,file_name text NOT NULL CHECK(length(file_name)<=200),
 kind text NOT NULL CHECK(kind IN ('immatriculation','assurance','licence','agrement','certification','excel','autre')),
 mime_type text NOT NULL,size_bytes bigint NOT NULL CHECK(size_bytes>0 AND size_bytes<=10485760),expires_on date,
 created_at timestamptz NOT NULL DEFAULT now(),CHECK(split_part(storage_path,'/',1)=user_id::text)
);
CREATE INDEX partner_documents_user ON kopeagri.partner_documents(user_id);
ALTER TABLE kopeagri.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kopeagri.partner_documents ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE ON kopeagri.partner_applications TO authenticated;
GRANT SELECT,INSERT,DELETE ON kopeagri.partner_documents TO authenticated;
CREATE POLICY applications_read ON kopeagri.partner_applications FOR SELECT TO authenticated USING(user_id=(select auth.uid()) OR EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=(select auth.uid())));
CREATE POLICY applications_insert ON kopeagri.partner_applications FOR INSERT TO authenticated WITH CHECK(user_id=(select auth.uid()) AND status IN ('draft','submitted') AND reviewed_by IS NULL AND reviewed_at IS NULL AND review_note='');
CREATE POLICY applications_update ON kopeagri.partner_applications FOR UPDATE TO authenticated USING(user_id=(select auth.uid()) OR EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=(select auth.uid()))) WITH CHECK(user_id=(select auth.uid()) OR EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=(select auth.uid())));
CREATE POLICY documents_read ON kopeagri.partner_documents FOR SELECT TO authenticated USING(user_id=(select auth.uid()) OR EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=(select auth.uid())));
CREATE POLICY documents_insert ON kopeagri.partner_documents FOR INSERT TO authenticated WITH CHECK(user_id=(select auth.uid()));
CREATE POLICY documents_delete ON kopeagri.partner_documents FOR DELETE TO authenticated USING(user_id=(select auth.uid()));
CREATE FUNCTION kopeagri.guard_partner_application() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE reviewer boolean;
BEGIN
 SELECT EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=auth.uid()) INTO reviewer;
 IF TG_OP='UPDATE' THEN
  IF NEW.user_id<>OLD.user_id OR NEW.reference<>OLD.reference THEN RAISE EXCEPTION 'Identifiant non modifiable'; END IF;
  IF NOT reviewer AND (NEW.status IN ('approved','rejected','needs_changes') OR NEW.review_note IS DISTINCT FROM OLD.review_note OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at) THEN RAISE EXCEPTION 'Validation réservée à la coordination'; END IF;
 END IF;
 IF NEW.status IN ('submitted','approved') THEN
  IF length(trim(NEW.full_name))<2 OR length(trim(NEW.phone))<6 OR length(trim(NEW.address))<3 OR length(trim(NEW.commune))<2 OR NEW.consent_at IS NULL THEN RAISE EXCEPTION 'Identité, téléphone, adresse, commune et accord requis'; END IF;
  IF NEW.role<>'acheteur_b2c' AND length(trim(NEW.company))<2 THEN RAISE EXCEPTION 'Raison sociale requise'; END IF;
 END IF;
 IF NEW.status='submitted' THEN NEW.submitted_at=now(); END IF;
 IF reviewer AND NEW.status IN ('approved','rejected','needs_changes') THEN NEW.reviewed_at=now();NEW.reviewed_by=auth.uid(); END IF;
 NEW.updated_at=now(); RETURN NEW;
END $$;
CREATE TRIGGER guard_partner_application BEFORE INSERT OR UPDATE ON kopeagri.partner_applications FOR EACH ROW EXECUTE FUNCTION kopeagri.guard_partner_application();
CREATE VIEW api.partner_applications WITH(security_invoker=true) AS SELECT * FROM kopeagri.partner_applications;
CREATE VIEW api.partner_documents WITH(security_invoker=true) AS SELECT * FROM kopeagri.partner_documents;
CREATE VIEW api.partner_reviewers WITH(security_invoker=true) AS SELECT * FROM kopeagri.partner_reviewers;
GRANT SELECT,INSERT,UPDATE ON api.partner_applications TO authenticated;
GRANT SELECT,INSERT,DELETE ON api.partner_documents TO authenticated;
GRANT SELECT ON api.partner_reviewers TO authenticated;
REVOKE ALL ON api.partner_applications,api.partner_documents,api.partner_reviewers FROM anon;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('kopeagri-partner-documents','kopeagri-partner-documents',false,10485760,ARRAY['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
CREATE POLICY kopeagri_documents_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='kopeagri-partner-documents' AND ((storage.foldername(name))[1]=(select auth.uid())::text OR EXISTS(SELECT 1 FROM kopeagri.partner_reviewers WHERE user_id=(select auth.uid()))));
CREATE POLICY kopeagri_documents_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='kopeagri-partner-documents' AND (storage.foldername(name))[1]=(select auth.uid())::text AND EXISTS(SELECT 1 FROM kopeagri.partner_applications WHERE user_id=(select auth.uid())));
CREATE POLICY kopeagri_documents_remove ON storage.objects FOR DELETE TO authenticated USING(bucket_id='kopeagri-partner-documents' AND (storage.foldername(name))[1]=(select auth.uid())::text);
-- The existing signup trigger must not reject DELIKREOL roles or grant an admin role from editable metadata.
CREATE OR REPLACE FUNCTION kopeagri.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.raw_user_meta_data->>'app' IS DISTINCT FROM 'kopeagri' THEN RETURN NEW; END IF;
 INSERT INTO kopeagri.profiles(id,email,full_name,role,commune,phone)
 VALUES(NEW.id,NEW.email,coalesce(NEW.raw_user_meta_data->>'full_name',''),'producteur',NEW.raw_user_meta_data->>'commune',NEW.raw_user_meta_data->>'phone') ON CONFLICT(id) DO NOTHING;
 RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION kopeagri.handle_new_user() FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
