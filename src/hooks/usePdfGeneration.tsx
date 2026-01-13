import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePdfGeneration() {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async (vaultId: string) => {
    setGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to download PDF');
        return null;
      }

      // Load the exact cover background PNG used by the preview so the PDF matches.
      let coverBgPngBase64: string | null = null;
      try {
        const { data: vault } = await supabase
          .from('vaults')
          .select('vault_type')
          .eq('id', vaultId)
          .single();

        const type = String(vault?.vault_type ?? '').toLowerCase();
        const coverPath = type.includes('homecoming')
          ? '/covers/homecoming-cover-bg.png'
          : type.includes('returned')
            ? '/covers/returned-cover-bg.png'
            : '/covers/farewell-cover-bg.png';

        const res = await fetch(coverPath);
        if (res.ok) {
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read cover image'));
            reader.readAsDataURL(blob);
          });
          coverBgPngBase64 = dataUrl.split(',')[1] || null;
        }
      } catch {
        // If this fails, we still generate a PDF with a solid cover color.
      }

      const response = await supabase.functions.invoke('generate-pdf', {
        body: { vaultId, coverBgPngBase64 },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { pdf, filename } = response.data;
      
      // Convert base64 to blob
      const binaryString = atob(pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
      return { success: true };
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generatePdf, generating };
}
