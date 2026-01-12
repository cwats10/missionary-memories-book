-- Drop the existing check constraint and add 'purchased' as a valid status
ALTER TABLE public.vaults DROP CONSTRAINT vaults_status_check;

ALTER TABLE public.vaults ADD CONSTRAINT vaults_status_check 
  CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'printed'::text, 'purchased'::text]));