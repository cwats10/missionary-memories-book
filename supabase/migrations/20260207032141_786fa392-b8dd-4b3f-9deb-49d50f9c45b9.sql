-- Add page template support for museum-quality PDF layouts
ALTER TABLE public.pages 
  ADD COLUMN IF NOT EXISTS page_template text DEFAULT 'image_reflection',
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS is_signature_spread boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS timeline_data jsonb;

-- Add constraint for valid templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_page_template'
  ) THEN
    ALTER TABLE public.pages 
      ADD CONSTRAINT valid_page_template 
      CHECK (page_template IN ('hero_image', 'image_reflection', 'story', 'timeline'));
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.pages.page_template IS 'Page layout template: hero_image, image_reflection, story, or timeline';
COMMENT ON COLUMN public.pages.caption IS 'Optional caption for hero image template (50 char max)';
COMMENT ON COLUMN public.pages.is_signature_spread IS 'Whether this page is part of a signature emotional spread';
COMMENT ON COLUMN public.pages.timeline_data IS 'JSON array of timeline entries for timeline template';