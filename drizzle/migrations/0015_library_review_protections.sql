REVOKE EXECUTE ON FUNCTION public.claim_library_download(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.claim_library_download(uuid, text) FROM PUBLIC, anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.validate_resource_issue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.issue_type NOT IN ('EVIDENCE_OUTDATED','SOURCE_BROKEN','COPYRIGHT_CONCERN','INACCURATE_CONTENT','OTHER') OR length(btrim(NEW.message)) NOT BETWEEN 10 AND 2000 THEN
    RAISE EXCEPTION 'Invalid issue details' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.knowledge_resources WHERE id = NEW.resource_id AND published AND rights_status NOT IN ('PENDING_REVIEW','TAKEDOWN_REVIEW','REMOVED')) THEN
    RAISE EXCEPTION 'Resource unavailable' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('library-issue:' || NEW.user_id::text, 0));
  IF (SELECT count(*) FROM public.resource_issues WHERE user_id = NEW.user_id AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Issue report limit reached. Please try again later.' USING ERRCODE = 'P0001';
  END IF;
  NEW.created_at := now();
  NEW.message := btrim(NEW.message);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_resource_issue() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_resource_issue_before_insert BEFORE INSERT ON public.resource_issues FOR EACH ROW EXECUTE FUNCTION public.validate_resource_issue();
COMMENT ON FUNCTION public.validate_resource_issue() IS 'Library issue validation and custom per-account limit of five reports per rolling hour, serialized across direct and server submissions.';