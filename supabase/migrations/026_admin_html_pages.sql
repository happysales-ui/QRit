-- Admin-hosted HTML pages with public share links at /s/[slug]

CREATE TABLE public.admin_html_pages (
  slug text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  html text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_html_pages_slug_format CHECK (
    slug ~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$'
  )
);

CREATE INDEX admin_html_pages_updated_at_idx
  ON public.admin_html_pages (updated_at DESC);

ALTER TABLE public.admin_html_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published share pages (no login on /s/[slug])
CREATE POLICY "admin_html_pages_public_select"
  ON public.admin_html_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profile admins may manage rows from the client; password-gate flows use service role
CREATE POLICY "admin_html_pages_admin_insert"
  ON public.admin_html_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_profile_admin());

CREATE POLICY "admin_html_pages_admin_update"
  ON public.admin_html_pages
  FOR UPDATE
  TO authenticated
  USING (public.is_profile_admin())
  WITH CHECK (public.is_profile_admin());

CREATE POLICY "admin_html_pages_admin_delete"
  ON public.admin_html_pages
  FOR DELETE
  TO authenticated
  USING (public.is_profile_admin());

COMMENT ON TABLE public.admin_html_pages IS
  'Admin-uploaded HTML pages served publicly at /s/[slug]. Seed fireworks via app or paste in /admin/pages.';
