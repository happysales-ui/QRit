-- Security: prevent anon SELECT of hidden active links (account numbers, MECARD, etc.)
DROP POLICY IF EXISTS "links_public_select_active" ON public.links;
CREATE POLICY "links_public_select_active"
  ON public.links
  FOR SELECT
  USING (
    (is_active = true AND is_hidden = false)
    OR profile_id = auth.uid()
  );
