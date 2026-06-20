-- Soft-hide links from public profile without deleting

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.links.is_hidden IS 'When true, link is hidden from public profile but visible in owner dashboard';
