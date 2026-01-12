-- Add contributor_page_limit column to vaults table
ALTER TABLE public.vaults 
ADD COLUMN contributor_page_limit integer NOT NULL DEFAULT 1;

-- Add a check constraint to ensure valid values (1-4)
ALTER TABLE public.vaults 
ADD CONSTRAINT contributor_page_limit_range 
CHECK (contributor_page_limit >= 1 AND contributor_page_limit <= 4);