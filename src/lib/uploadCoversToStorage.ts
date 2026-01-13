import { supabase } from '@/integrations/supabase/client';

const COVER_FILES = [
  'farewell-cover-bg.png',
  'homecoming-cover-bg.png',
  'returned-cover-bg.png',
];

/**
 * Ensures all cover background images are uploaded to Supabase Storage.
 * This is idempotent—if a file already exists, it won't be re-uploaded.
 */
export async function ensureCoversInStorage() {
  for (const fileName of COVER_FILES) {
    try {
      // Check if already exists
      const { data: existingFile } = await supabase.storage
        .from('cover-images')
        .list('', { search: fileName, limit: 1 });

      if (existingFile && existingFile.some((f) => f.name === fileName)) {
        continue; // Already uploaded
      }

      // Fetch from public folder
      const res = await fetch(`/covers/${fileName}`);
      if (!res.ok) continue;

      const blob = await res.blob();

      // Upload to storage
      await supabase.storage
        .from('cover-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });
    } catch {
      // Silently continue if one fails
    }
  }
}
