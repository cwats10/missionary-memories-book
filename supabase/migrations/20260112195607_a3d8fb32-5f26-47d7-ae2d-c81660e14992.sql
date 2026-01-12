-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_response TEXT,
  responded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own tickets (only certain fields)
CREATE POLICY "Users can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
ON public.support_tickets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
ON public.support_tickets
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Admin policies for profiles (view all users)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles (manage all users)
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for vaults (view all vaults)
CREATE POLICY "Admins can view all vaults"
ON public.vaults
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for vaults (manage all vaults)
CREATE POLICY "Admins can manage all vaults"
ON public.vaults
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for vault_contributors (view all)
CREATE POLICY "Admins can view all vault contributors"
ON public.vault_contributors
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for vault_contributors (manage all)
CREATE POLICY "Admins can manage all vault contributors"
ON public.vault_contributors
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for pages (view all)
CREATE POLICY "Admins can view all pages"
ON public.pages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for pages (manage all)
CREATE POLICY "Admins can manage all pages"
ON public.pages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_roles (view all)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_roles (manage all)
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to assign admin role by email (for initial setup)
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(admin_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user_id from profiles by email
  SELECT user_id INTO target_user_id FROM public.profiles WHERE email = admin_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;