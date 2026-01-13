import { supabase } from '@/integrations/supabase/client';
import { compressImageBlobToJpeg } from '@/lib/imageCompression';

const COVER_FILES = [
  { source: 'farewell-cover-bg.png', target: 'farewell-cover-bg.jpg' },
  { source: 'homecoming-cover-bg.png', target: 'homecoming-cover-bg.jpg' },
  { source: 'returned-cover-bg.png', target: 'returned-cover-bg.jpg' },
];

/**
 * Ensures all cover background images are uploaded to file storage.
 * This is idempotent—if a file already exists, it won't be re-uploaded.
 * Must be called when user is authenticated.
 */
export async function ensureCoversInStorage() {
  // Only run if user is authenticated (needed for upload policy)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return; // Skip if not authenticated; will run again on next auth change
  }

  // Prevent re-processing every time (covers are static)
  const markerKey = 'covers_uploaded_v2_jpg';
  try {
    if (localStorage.getItem(markerKey) === '1') return;
  } catch {
    // ignore (private mode / disabled storage)
  }

  for (const { source, target } of COVER_FILES) {
    try {
      // Check if already exists
      const { data: existingFiles } = await supabase.storage
        .from('cover-images')
        .list('', { search: target, limit: 1 });

      if (existingFiles && existingFiles.some((f) => f.name === target)) {
        continue; // Already uploaded
      }

      // Fetch from public folder
      const res = await fetch(`/covers/${source}`);
      if (!res.ok) {
        console.warn(`Failed to fetch local cover: ${source}`);
        continue;
      }

      const blob = await res.blob();

      // Covers can be larger than page images; keep more detail but still convert PNG -> JPG
      const jpgBlob = await compressImageBlobToJpeg(blob, {
        maxDimension: 2800,
        quality: 0.9,
      });

      // Upload to storage (upsert in case of partial uploads)
      const { error } = await supabase.storage
        .from('cover-images')
        .upload(target, jpgBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn(`Failed to upload cover ${target}:`, error.message);
      } else {
        console.log(`Uploaded cover image: ${target}`);
      }
    } catch (e) {
      console.warn(`Error processing cover image:`, e);
    }
  }

  try {
    localStorage.setItem(markerKey, '1');
  } catch {
    // ignore
  }
}
