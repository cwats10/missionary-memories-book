-- Create a public bucket for cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-images', 'cover-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to cover images
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cover-images');