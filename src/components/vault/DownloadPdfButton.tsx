import { Button } from '@/components/ui/button';
import { usePdfGeneration } from '@/hooks/usePdfGeneration';
import { FileDown, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DownloadPdfButtonProps {
  vaultId: string;
  disabled?: boolean;
  purchased?: boolean;
}

export function DownloadPdfButton({ vaultId, disabled, purchased = false }: DownloadPdfButtonProps) {
  const { generatePdf, generating } = usePdfGeneration();

  const isDisabledDueToNoPurchase = !purchased;
  const isFullyDisabled = generating || disabled || isDisabledDueToNoPurchase;

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generatePdf(vaultId)}
      disabled={isFullyDisabled}
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

  // Show tooltip only when disabled due to no purchase
  if (isDisabledDueToNoPurchase && !generating) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-block">
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download is available after the vault is purchased</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
