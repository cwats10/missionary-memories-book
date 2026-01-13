-- Add book_size column to vaults table
-- Options: '9x9' (9x9" square), '12x12' (12x12" square), 'a4' (A4 portrait), 'a5' (A5)
ALTER TABLE public.vaults 
ADD COLUMN book_size text NOT NULL DEFAULT '9x9';

-- Add check constraint for valid book sizes
ALTER TABLE public.vaults
ADD CONSTRAINT vaults_book_size_check 
CHECK (book_size IN ('9x9', '12x12', 'a4', 'a5'));