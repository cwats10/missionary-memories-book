import { Button } from '@/components/ui/button';
import { usePdfGeneration } from '@/hooks/usePdfGeneration';
import { FileDown, Loader2 } from 'lucide-react';

interface DownloadPdfButtonProps {
  vaultId: string;
  disabled?: boolean;
}

export function DownloadPdfButton({ vaultId, disabled }: DownloadPdfButtonProps) {
  const { generatePdf, generating } = usePdfGeneration();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generatePdf(vaultId)}
      disabled={generating || disabled}
      className="gap-1.5"
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
