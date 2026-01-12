-- Drop existing problematic policies on vaults
DROP POLICY IF EXISTS "Contributors can view vaults they contribute to" ON public.vaults;
DROP POLICY IF EXISTS "Owners can manage their vaults" ON public.vaults;

-- Create a security definer function to check vault access without recursion
CREATE OR REPLACE FUNCTION public.user_is_vault_contributor(_user_id uuid, _vault_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vault_contributors
    WHERE user_id = _user_id
      AND vault_id = _vault_id
  )
$$;

-- Create new non-recursive policies for vaults
CREATE POLICY "Owners can manage their vaults"
ON public.vaults
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Contributors can view vaults they contribute to"
ON public.vaults
FOR SELECT
TO authenticated
USING (public.user_is_vault_contributor(auth.uid(), id));