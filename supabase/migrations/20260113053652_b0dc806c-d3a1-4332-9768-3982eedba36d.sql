-- Allow authenticated users to seed the built-in cover background images
-- (needed so the app can upload the 3 static images into the public cover-images bucket).

CREATE POLICY "Authenticated can upload cover images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-images'
  AND name IN (
    'farewell-cover-bg.png',
    'homecoming-cover-bg.png',
    'returned-cover-bg.png'
  )
);
