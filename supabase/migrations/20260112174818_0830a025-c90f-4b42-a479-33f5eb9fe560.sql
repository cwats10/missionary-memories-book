-- Add vault_type column to vaults table
ALTER TABLE public.vaults 
ADD COLUMN vault_type text NOT NULL DEFAULT 'farewell' 
CHECK (vault_type IN ('farewell', 'homecoming', 'returned'));

-- Add comment for clarity
COMMENT ON COLUMN public.vaults.vault_type IS 'Type of vault: farewell (bone parchment), homecoming (deep forest), or returned (deep charcoal)';