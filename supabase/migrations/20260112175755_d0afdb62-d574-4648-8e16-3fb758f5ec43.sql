-- Add image_urls array column to pages table for multiple images (up to 3)
ALTER TABLE public.pages 
ADD COLUMN image_urls text[] DEFAULT '{}';

-- Migrate existing image_url data to image_urls array
UPDATE public.pages 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '';

-- Add comment for clarity
COMMENT ON COLUMN public.pages.image_urls IS 'Array of up to 3 image URLs for this memory page';