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
  /** Optional tooltip message when the button is disabled for reasons other than purchase */
  disabledReason?: string;
}

export function DownloadPdfButton({
  vaultId,
  disabled,
  purchased = false,
  disabledReason,
}: DownloadPdfButtonProps) {
  const { generatePdf, generating } = usePdfGeneration();

  const isDisabledDueToNoPurchase = !purchased;
  const isFullyDisabled = generating || disabled || isDisabledDueToNoPurchase;

  const tooltipMessage = isDisabledDueToNoPurchase
    ? 'Download is available after the vault is purchased'
    : disabledReason;

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

  // When disabled, wrap with tooltip so users understand why.
  // (Radix Tooltip doesn't work on disabled buttons directly.)
  if (isFullyDisabled && !generating && tooltipMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-block">
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
