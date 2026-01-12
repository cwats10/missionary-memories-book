-- Add mission details to vaults table
ALTER TABLE public.vaults 
ADD COLUMN mission_name text,
ADD COLUMN service_start_date date,
ADD COLUMN service_end_date date;

-- Update recipient_name comment to clarify it's the missionary name
COMMENT ON COLUMN public.vaults.recipient_name IS 'The missionary''s full name';