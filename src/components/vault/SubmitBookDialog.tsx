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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Send,
  CheckCircle2,
  FileText,
  Package,
  Gem,
  Loader2,
  AlertCircle,
  Truck,
  HandHeart,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { OrderFormat } from '@/components/vault/CheckoutDialog';

interface SubmitBookDialogProps {
  vaultId: string;
  approvedPageCount: number;
  orderFormat: OrderFormat | null;
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: (status: string) => Promise<{ error: Error | null }>;
}

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const emptyShipping = (): ShippingInfo => ({
  name: '', email: '', phone: '', line1: '', line2: '',
  city: '', state: '', zip: '', country: 'US',
});

function isShippingValid(s: ShippingInfo) {
  return s.name && s.email && s.line1 && s.city && s.state && s.zip && s.country;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormatBadge({ format }: { format: OrderFormat | null }) {
  if (format === 'pdf')
    return (
      <div className="flex items-center gap-2 text-primary">
        <FileText className="h-4 w-4" />
        <span className="font-serif-text text-sm font-medium">Digital PDF</span>
      </div>
    );
  if (format === 'heirloom')
    return (
      <div className="flex items-center gap-2 text-gold">
        <Gem className="h-4 w-4" />
        <span className="font-serif-text text-sm font-medium">Heirloom Edition (Printique)</span>
      </div>
    );
  return (
    <div className="flex items-center gap-2 text-primary">
      <Package className="h-4 w-4" />
      <span className="font-serif-text text-sm font-medium">Standard Hardcover (Prodigi)</span>
    </div>
  );
}

function ShippingForm({
  value,
  onChange,
  label = 'Shipping Address',
  showPhone = true,
}: {
  value: ShippingInfo;
  onChange: (v: ShippingInfo) => void;
  label?: string;
  showPhone?: boolean;
}) {
  const set = (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-3">
      <p className="font-serif text-sm tracking-wide">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Full Name *</Label>
          <Input placeholder="Jane Smith" value={value.name} onChange={set('name')} />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Email *</Label>
          <Input type="email" placeholder="jane@example.com" value={value.email} onChange={set('email')} />
        </div>
        {showPhone && (
          <div className="col-span-2">
            <Label className="text-xs">Phone (recommended for international orders)</Label>
            <Input type="tel" placeholder="+1 801 555 0100" value={value.phone} onChange={set('phone')} />
          </div>
        )}
        <div className="col-span-2">
          <Label className="text-xs">Street Address *</Label>
          <Input placeholder="123 Main St" value={value.line1} onChange={set('line1')} />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Apt / Suite (optional)</Label>
          <Input placeholder="Apt 2B" value={value.line2} onChange={set('line2')} />
        </div>
        <div>
          <Label className="text-xs">City *</Label>
          <Input placeholder="Salt Lake City" value={value.city} onChange={set('city')} />
        </div>
        <div>
          <Label className="text-xs">State *</Label>
          <Input placeholder="UT" maxLength={2} value={value.state} onChange={set('state')} />
        </div>
        <div>
          <Label className="text-xs">ZIP *</Label>
          <Input placeholder="84101" value={value.zip} onChange={set('zip')} />
        </div>
        <div>
          <Label className="text-xs">Country *</Label>
          <Input placeholder="US" maxLength={2} value={value.country} onChange={set('country')} />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SubmitBookDialog({
  vaultId,
  approvedPageCount,
  orderFormat,
  disabled,
  disabledReason,
  onSubmit,
}: SubmitBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'review' | 'details' | 'submitting' | 'done' | 'error'>('review');
  const [shipping, setShipping] = useState<ShippingInfo>(emptyShipping());
  const [prodigiOrderId, setProdigiOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const needsDetails = orderFormat === 'standard' || orderFormat === 'heirloom';

  const handleClose = (o: boolean) => {
    if (!o && step !== 'done') {
      setTimeout(() => {
        setStep('review');
        setShipping(emptyShipping());
        setErrorMsg(null);
        setProdigiOrderId(null);
      }, 200);
    }
    setOpen(o);
  };

  const handleSubmit = async () => {
    setStep('submitting');
    setErrorMsg(null);

    try {
      if (orderFormat === 'standard') {
        // Call the submit-to-prodigi edge function
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-to-prodigi`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token ?? ''}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vaultId, shipping }),
          },
        );
        const result = await res.json();

        if (!result.success) {
          throw new Error(result.error ?? 'Prodigi submission failed');
        }

        setProdigiOrderId(result.prodigiOrderId);
        // Edge function already set vault.status = 'submitted', but also call local callback
        await onSubmit('submitted');

      } else if (orderFormat === 'heirloom') {
        // Manual Printique flow — update status and notify admin
        const { error } = await onSubmit('submitted_heirloom');
        if (error) throw error;

      } else {
        // PDF — just mark as submitted
        const { error } = await onSubmit('submitted');
        if (error) throw error;
      }

      setStep('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      setStep('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
          className={cn(
            'gap-2 text-white hover:opacity-90',
            orderFormat === 'heirloom'
              ? 'bg-gold/80 hover:bg-gold/70'
              : 'bg-[#2F3E36] hover:bg-[#2F3E36]',
          )}
        >
          {orderFormat === 'heirloom' ? (
            <>
              <Gem className="h-4 w-4" />
              Submit Heirloom Book
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Book for Printing
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">

        {/* ─── REVIEW ─────────────────────────────────────────────── */}
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Submit Your Book</DialogTitle>
              <DialogDescription>
                Review the details before finalizing your book for production.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Summary */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-3">
                <FormatBadge format={orderFormat} />
                <p className="font-serif-text text-xs text-muted-foreground">
                  {approvedPageCount} approved {approvedPageCount === 1 ? 'page' : 'pages'} in current order
                </p>
                <div className="space-y-1 font-serif-text text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    All approved pages included in print order
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    Pages ordered as arranged in your vault
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    Title page included as first page
                  </div>
                </div>
              </div>

              {/* Format-specific notes */}
              {orderFormat === 'standard' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Truck className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="font-serif-text text-xs text-blue-700 dark:text-blue-300">
                    Your book will be submitted automatically to Prodigi. You'll enter shipping details on the next screen. Allow 5–7 business days for delivery.
                  </p>
                </div>
              )}
              {orderFormat === 'heirloom' && (
                <div className="flex items-start gap-2 p-3 bg-gold/5 border border-gold/25 rounded-lg">
                  <HandHeart className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                  <p className="font-serif-text text-xs text-muted-foreground">
                    Your book will be ordered manually through Printique by our team and hand-delivered. Provide a delivery contact on the next screen. Allow 10–14 business days.
                  </p>
                </div>
              )}
              {orderFormat === 'pdf' && (
                <div className="flex items-start gap-2 p-3 bg-muted/40 border border-border rounded-lg">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-serif-text text-xs text-muted-foreground">
                    Your PDF will be generated and made available for immediate download.
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="font-serif-text text-xs text-amber-800 dark:text-amber-200">
                  Once submitted, page edits will not be reflected in the print order. Make sure your pages are final.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Go Back
                </Button>
                <Button
                  onClick={() => needsDetails ? setStep('details') : handleSubmit()}
                  className="flex-1 gap-2"
                >
                  {needsDetails ? 'Continue' : (
                    <>
                      <Send className="h-4 w-4" />
                      Confirm &amp; Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─── DETAILS (shipping / delivery) ──────────────────────── */}
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {orderFormat === 'heirloom' ? 'Delivery Contact' : 'Shipping Address'}
              </DialogTitle>
              <DialogDescription>
                {orderFormat === 'heirloom'
                  ? 'Where should the heirloom book be hand-delivered?'
                  : 'Where should Prodigi ship your book?'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <ShippingForm
                value={shipping}
                onChange={setShipping}
                label={orderFormat === 'heirloom' ? 'Delivery Address' : 'Shipping Address'}
                showPhone={orderFormat === 'standard'}
              />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep('review')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isShippingValid(shipping)}
                  className="flex-1 gap-2"
                >
                  <Send className="h-4 w-4" />
                  Confirm &amp; Submit
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─── SUBMITTING ─────────────────────────────────────────── */}
        {step === 'submitting' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="font-serif text-lg">
              {orderFormat === 'standard' ? 'Generating PDF and submitting to Prodigi…' : 'Submitting your book…'}
            </p>
            <p className="font-serif-text text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        )}

        {/* ─── DONE ───────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="font-serif text-2xl mb-2">Book Submitted!</DialogTitle>
            <DialogDescription className="mb-4 mx-auto max-w-sm">
              {orderFormat === 'standard' && prodigiOrderId
                ? `Your book is now in the Prodigi production queue. Order ID: ${prodigiOrderId}`
                : orderFormat === 'heirloom'
                  ? 'Your heirloom order has been received. Our team will place the Printique order and arrange hand delivery.'
                  : 'Your PDF is ready. Use the Download PDF button to get your file.'}
            </DialogDescription>

            {/* Fulfillment progress */}
            <div className="p-4 bg-muted/40 rounded-lg text-left mb-6 space-y-1.5 font-serif-text text-sm">
              <p className="text-foreground font-medium">
                ✓ Submitted
                {orderFormat === 'standard' && prodigiOrderId && ` — Prodigi #${prodigiOrderId}`}
              </p>
              <p className="text-muted-foreground opacity-60">○ In Production</p>
              <p className="text-muted-foreground opacity-60">
                ○ {orderFormat === 'heirloom' ? 'Ready for Delivery' : 'Shipped'}
              </p>
              <p className="text-muted-foreground opacity-60">
                ○ {orderFormat === 'heirloom' ? 'Delivered' : 'Delivered'}
              </p>
            </div>

            <Button onClick={() => setOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        )}

        {/* ─── ERROR ──────────────────────────────────────────────── */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-destructive">Submission Failed</DialogTitle>
              <DialogDescription>Something went wrong. You can retry or contact support.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg font-mono text-xs text-destructive break-all">
                  {errorMsg}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep('review')} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
