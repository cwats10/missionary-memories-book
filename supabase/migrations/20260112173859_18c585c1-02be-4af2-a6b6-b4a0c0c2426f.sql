-- Allow users to view profiles of contributors in vaults they belong to
CREATE POLICY "Users can view profiles of vault co-contributors"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vault_contributors vc1
    JOIN vault_contributors vc2 ON vc1.vault_id = vc2.vault_id
    WHERE vc1.user_id = auth.uid() AND vc2.user_id = profiles.user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM vaults v
    JOIN vault_contributors vc ON v.id = vc.vault_id
    WHERE v.owner_id = auth.uid() AND vc.user_id = profiles.user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM vaults v
    WHERE v.owner_id = auth.uid() AND profiles.user_id = v.owner_id
  )
);