-- Create vaults table for memory books
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  recipient_name TEXT NOT NULL,
  occasion TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'printed')),
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pages table for individual memories
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  page_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vault_contributors table to track who can contribute
CREATE TABLE public.vault_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'contributor',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(vault_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_contributors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vaults
CREATE POLICY "Owners can manage their vaults"
ON public.vaults FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Contributors can view vaults they contribute to"
ON public.vaults FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vault_contributors
    WHERE vault_contributors.vault_id = vaults.id
    AND vault_contributors.user_id = auth.uid()
  )
);

-- RLS Policies for pages
CREATE POLICY "Vault owners can manage all pages"
ON public.pages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = pages.vault_id
    AND vaults.owner_id = auth.uid()
  )
);

CREATE POLICY "Contributors can manage their own pages"
ON public.pages FOR ALL
USING (auth.uid() = contributor_id);

CREATE POLICY "Contributors can view pages in their vaults"
ON public.pages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vault_contributors
    WHERE vault_contributors.vault_id = pages.vault_id
    AND vault_contributors.user_id = auth.uid()
  )
);

-- RLS Policies for vault_contributors
CREATE POLICY "Vault owners can manage contributors"
ON public.vault_contributors FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = vault_contributors.vault_id
    AND vaults.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own contributor records"
ON public.vault_contributors FOR SELECT
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_vaults_updated_at
BEFORE UPDATE ON public.vaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();