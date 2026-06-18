-- Default QR scan destination: NULL = integrated profile page, otherwise direct link redirect

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_link_id UUID REFERENCES public.links (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.default_link_id IS 'QR scan default destination link; NULL = integrated profile page';
