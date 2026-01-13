import { supabase } from '@/integrations/supabase/client';

const COVER_FILES = [
  'farewell-cover-bg.png',
  'homecoming-cover-bg.png',
  'returned-cover-bg.png',
];

/**
 * Ensures all cover background images are uploaded to Supabase Storage.
 * This is idempotent—if a file already exists, it won't be re-uploaded.
 * Must be called when user is authenticated.
 */
export async function ensureCoversInStorage() {
  // Only run if user is authenticated (needed for upload policy)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return; // Skip if not authenticated; will run again on next auth change
  }

  for (const fileName of COVER_FILES) {
    try {
      // Check if already exists by trying to get public URL and checking storage list
      const { data: existingFiles } = await supabase.storage
        .from('cover-images')
        .list('', { search: fileName, limit: 1 });

      if (existingFiles && existingFiles.some((f) => f.name === fileName)) {
        continue; // Already uploaded
      }

      // Fetch from public folder
      const res = await fetch(`/covers/${fileName}`);
      if (!res.ok) {
        console.warn(`Failed to fetch local cover: ${fileName}`);
        continue;
      }

      const blob = await res.blob();

      // Upload to storage (upsert in case of partial uploads)
      const { error } = await supabase.storage
        .from('cover-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        console.warn(`Failed to upload cover ${fileName}:`, error.message);
      } else {
        console.log(`Uploaded cover image: ${fileName}`);
      }
    } catch (e) {
      console.warn(`Error processing cover ${fileName}:`, e);
    }
  }
}
