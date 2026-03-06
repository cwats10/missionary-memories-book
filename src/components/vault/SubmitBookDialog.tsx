import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2, FileText, Package, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitBookDialogProps {
  vaultId: string;
  approvedPageCount: number;
  orderType: 'pdf' | 'print' | null;
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: () => Promise<{ error: Error | null }>;
}

export function SubmitBookDialog({
  approvedPageCount,
  orderType,
  disabled,
  disabledReason,
  onSubmit,
}: SubmitBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const { error: err } = await onSubmit();
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } else {
      setDone(true);
    }
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      // Reset local state on close unless done (let parent handle vault status)
      setTimeout(() => {
        if (!done) {
          setError(null);
          setSubmitting(false);
        }
      }, 200);
    }
    setOpen(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
          className="gap-2 text-white hover:opacity-90"
          style={{ backgroundColor: '#2F3E36' }}
        >
          <Send className="h-4 w-4" />
          Submit Book for Printing
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {!done ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Submit Your Book</DialogTitle>
              <DialogDescription>
                Review the details below, then submit your finalized book to begin fulfillment.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Summary card */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {orderType === 'pdf' ? (
                      <FileText className="h-4 w-4 text-primary" />
                    ) : (
                      <Package className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-serif-text text-sm font-medium">
                      {orderType === 'pdf' ? 'Digital PDF' : orderType === 'print' ? 'Printed Hardcover' : 'Book'}
                    </p>
                    <p className="font-serif-text text-xs text-muted-foreground">
                      {approvedPageCount} approved {approvedPageCount === 1 ? 'page' : 'pages'} ready to print
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground font-serif-text">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    All approved pages included
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    Pages ordered as arranged in your vault
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    Title page included
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="font-serif-text text-xs text-amber-800 dark:text-amber-200">
                  Once submitted, page changes will not be reflected in the print order. Make sure your pages are final before continuing.
                </p>
              </div>

              {error && (
                <p className="font-serif-text text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={submitting}>
                  Go Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Confirm &amp; Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="font-serif text-2xl mb-2">Book Submitted!</DialogTitle>
            <DialogDescription className="mb-6 mx-auto max-w-sm">
              Your book is now in the production queue. The admin team will follow up with fulfillment updates.
            </DialogDescription>
            <div className="p-4 bg-muted/40 rounded-lg text-left mb-6 text-sm font-serif-text text-muted-foreground space-y-1">
              <p>✓ <span className="text-foreground font-medium">Submitted</span> — your book is queued</p>
              <p className="opacity-50">○ In Production — printing underway</p>
              <p className="opacity-50">○ Shipped — on its way to you</p>
            </div>
            <Button onClick={() => setOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
