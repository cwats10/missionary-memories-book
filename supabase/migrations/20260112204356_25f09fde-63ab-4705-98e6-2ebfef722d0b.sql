-- Allow users to add themselves as contributors when accepting a valid invite
CREATE POLICY "Users can accept invites and add themselves as contributors"
ON public.vault_contributors
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.invite_links
    WHERE invite_links.vault_id = vault_contributors.vault_id
      AND invite_links.is_active = true
      AND invite_links.role = vault_contributors.role
      AND (invite_links.max_uses IS NULL OR invite_links.uses_count < invite_links.max_uses)
      AND (invite_links.expires_at IS NULL OR invite_links.expires_at > now())
  )
);