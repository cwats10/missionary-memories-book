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

      const response = await supabase.functions.invoke('generate-pdf', {
        body: { vaultId },
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
