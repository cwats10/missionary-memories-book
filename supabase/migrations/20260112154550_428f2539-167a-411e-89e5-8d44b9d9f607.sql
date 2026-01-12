-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own page images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to page images
CREATE POLICY "Anyone can view page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');