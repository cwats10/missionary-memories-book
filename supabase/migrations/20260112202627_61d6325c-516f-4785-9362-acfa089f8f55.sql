-- Users need to be able to check their own admin status
-- The existing "Users can view their own roles" policy should handle this,
-- but let's verify it's working by checking if the policy is PERMISSIVE

-- Drop and recreate the user roles SELECT policy as PERMISSIVE (not RESTRICTIVE)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);