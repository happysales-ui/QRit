-- Security: enforce allowed link URL protocols at the DB layer (defense in depth).
-- Permits https/http, MECARD contact payloads, and qrit:// transfer markers.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'links_url_protocol_check'
      AND conrelid = 'public.links'::regclass
  ) THEN
    ALTER TABLE public.links
      ADD CONSTRAINT links_url_protocol_check
      CHECK (url ~* '^(https?://|mecard:|qrit://)');
  END IF;
END $$;
