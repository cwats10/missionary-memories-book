-- Create invite_links table for shareable invite URLs
CREATE TABLE public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'contributor',
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- Vault owners can manage invite links
CREATE POLICY "Vault owners can manage invite links"
ON public.invite_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = invite_links.vault_id
    AND vaults.owner_id = auth.uid()
  )
);

-- Anyone can read active invite links (for accepting invites)
CREATE POLICY "Anyone can read active invite links by code"
ON public.invite_links FOR SELECT
USING (is_active = true);

-- Create function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;