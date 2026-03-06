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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { brandConfig } from '@/config/brandConfig';
import {
  ShoppingCart,
  Check,
  CreditCard,
  Package,
  FileDown,
  Truck,
  Lock,
  Gem,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export type OrderFormat = 'pdf' | 'standard' | 'heirloom';

interface CheckoutDialogProps {
  vaultTitle: string;
  pageCount: number;
  onOrderComplete?: (orderType: OrderFormat) => void;
  /** 'activate' = first-time payment gate. 'order' = standalone re-order button. */
  mode?: 'activate' | 'order';
}

export const CheckoutDialog = ({
  vaultTitle,
  pageCount,
  onOrderComplete,
  mode = 'order',
}: CheckoutDialogProps) => {
  const isActivate = mode === 'activate';

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'complete'>('select');
  const [orderType, setOrderType] = useState<OrderFormat>('standard');
  const [referralCode, setReferralCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [referralGenerated] = useState(
    'VAULT' + Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const { pricing } = brandConfig;

  const pdfPrice = pricing.pdfOnly;
  const standardTotal = pricing.printedBase + pageCount * pricing.perPage;
  const heirloomTotal = pricing.heirloomBase + pageCount * pricing.heirloomPerPage;

  const selectedPrice =
    orderType === 'pdf'
      ? pdfPrice
      : orderType === 'heirloom'
        ? heirloomTotal
        : standardTotal;
  const finalPrice = Math.max(0, selectedPrice - appliedDiscount);

  const handleApplyCode = () => {
    if (referralCode.toUpperCase() === 'FRIEND15' || referralCode.length >= 6) {
      setAppliedDiscount(pricing.referralDiscount);
      toast.success(`$${pricing.referralDiscount} discount applied!`);
    } else {
      toast.error('Invalid referral code');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    // TODO: integrate Stripe. This is sandbox / demo mode.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    await onOrderComplete?.(orderType);
    setStep('complete');
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('select');
      setReferralCode('');
      setAppliedDiscount(0);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 text-white hover:opacity-90 w-full sm:w-auto"
          style={{ backgroundColor: '#2F3E36' }}
        >
          {isActivate ? (
            <>
              <Lock className="h-4 w-4" />
              Activate Vault &amp; Pay
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Order Book
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* ─── STEP: SELECT FORMAT ─────────────────────────────────── */}
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {isActivate ? 'Activate Your Vault' : 'Order Your Book'}
              </DialogTitle>
              <DialogDescription>
                {isActivate
                  ? 'Choose your book format and pay to unlock sharing. You'll provide shipping details when you submit the finished book.'
                  : `Choose your preferred format for "${vaultTitle}"`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v as OrderFormat)}
                className="space-y-3"
              >
                {/* PDF */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    orderType === 'pdf' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Label htmlFor="pdf" className="flex items-start gap-4 cursor-pointer">
                    <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileDown className="h-4 w-4 text-primary" />
                        <span className="font-medium">Digital PDF</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        300 DPI print-ready file — download instantly after submitting
                      </p>
                      <p className="font-serif text-xl">${pdfPrice}</p>
                    </div>
                  </Label>
                </div>

                {/* Standard Print — Prodigi */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    orderType === 'standard' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Label htmlFor="standard" className="flex items-start gap-4 cursor-pointer">
                    <RadioGroupItem value="standard" id="standard" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Standard Hardcover</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Hardcover, lay-flat binding — ships directly to recipient
                      </p>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Fulfilled by Prodigi · 5–7 business days
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-serif text-xl">${standardTotal}</p>
                        <p className="text-sm text-muted-foreground">
                          Flat rate — all page counts included
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Heirloom — Printique */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    orderType === 'heirloom'
                      ? 'border-gold bg-gold/5'
                      : 'border-border'
                  }`}
                >
                  <Label htmlFor="heirloom" className="flex items-start gap-4 cursor-pointer">
                    <RadioGroupItem value="heirloom" id="heirloom" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gem className="h-4 w-4 text-gold" />
                        <span className="font-medium">Heirloom Edition</span>
                        <span className="text-xs bg-gold/15 text-gold/90 px-2 py-0.5 rounded border border-gold/20">
                          Premium
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Museum-quality lay-flat album, cloth bound or vegan leather cover, printed by Printique — hand-delivered personally
                      </p>
                      <div className="flex items-start gap-1 mb-2">
                        <Info className="h-3 w-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground/80 italic">
                          Because Printique has no API, your book is ordered manually and hand-delivered. Allow 10–14 business days.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="font-serif text-xl">${heirloomTotal}</p>
                        <p className="text-sm text-muted-foreground">
                          Flat rate — all page counts included
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Referral Code */}
              <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Have a referral code?</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCode} disabled={!referralCode}>
                    Apply
                  </Button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    ${appliedDiscount} discount applied
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-border">
                <span className="font-medium">Total due today</span>
                <div className="text-right">
                  {appliedDiscount > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      ${selectedPrice}
                    </span>
                  )}
                  <span className="font-serif text-2xl">${finalPrice}</span>
                </div>
              </div>

              {orderType === 'standard' && (
                <p className="text-xs text-muted-foreground -mt-2 mb-2">
                  Shipping address is collected at submission time, once your book is finalized.
                </p>
              )}
              {orderType === 'heirloom' && (
                <p className="text-xs text-muted-foreground -mt-2 mb-2">
                  Delivery contact is collected at submission time.
                </p>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {/* ─── STEP: PAYMENT ─────────────────────────────────────────── */}
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Payment Details</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                Secure checkout — demo mode, no real charges
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  🧪 <strong>Demo Mode:</strong> Stripe integration is pending. No real charges will occur.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Expiry</Label>
                    <Input placeholder="MM/YY" defaultValue="12/28" />
                  </div>
                  <div>
                    <Label className="text-sm">CVC</Label>
                    <Input placeholder="123" defaultValue="123" />
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="py-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {orderType === 'pdf'
                      ? 'Digital PDF'
                      : orderType === 'heirloom'
                        ? 'Heirloom Edition (Printique)'
                        : 'Standard Hardcover (Prodigi)'}
                  </span>
                  <span>${selectedPrice}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Referral Discount</span>
                    <span>-${appliedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${finalPrice}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handlePayment} disabled={processing} className="flex-1 gap-2">
                  {processing ? (
                    <>Processing…</>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay ${finalPrice}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP: COMPLETE ─────────────────────────────────────────── */}
        {step === 'complete' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="font-serif text-2xl mb-2">
              {isActivate ? 'Vault Activated!' : 'Order Confirmed!'}
            </DialogTitle>
            <DialogDescription className="mb-6 mx-auto max-w-sm">
              {isActivate
                ? orderType === 'heirloom'
                  ? 'Your vault is active with the Heirloom Edition. Share your invite link to start collecting memories — delivery details are collected when you submit the finished book.'
                  : 'Your vault is active. Share your invite link to start collecting memories. Shipping details are collected when you submit the finished book.'
                : 'Your payment is confirmed. Complete your book and submit it for printing.'}
            </DialogDescription>

            <div className="p-4 bg-muted/50 rounded-lg text-left mb-6">
              <p className="text-sm font-medium mb-1">Your Referral Code</p>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-2 rounded border border-border font-mono text-sm">
                  {referralGenerated}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(referralGenerated);
                    toast.success('Code copied!');
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code to give friends ${pricing.referralDiscount} off — you'll earn $
                {pricing.referralCredit} credit!
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
