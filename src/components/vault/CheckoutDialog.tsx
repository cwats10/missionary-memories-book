import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { brandConfig } from '@/config/brandConfig';
import { ShoppingCart, Check, CreditCard, Package, FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutDialogProps {
  vaultTitle: string;
  pageCount: number;
  onOrderComplete?: (orderType: 'pdf' | 'print') => void;
}

export const CheckoutDialog = ({ vaultTitle, pageCount, onOrderComplete }: CheckoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'complete'>('select');
  const [orderType, setOrderType] = useState<'pdf' | 'print'>('print');
  const [referralCode, setReferralCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const { pricing } = brandConfig;
  
  const pdfPrice = pricing.pdfOnly;
  const printBasePrice = pricing.printedBase;
  const perPagePrice = pricing.perPage;
  const printTotal = printBasePrice + (pageCount * perPagePrice);
  
  const selectedPrice = orderType === 'pdf' ? pdfPrice : printTotal;
  const finalPrice = Math.max(0, selectedPrice - appliedDiscount);

  const handleApplyCode = () => {
    // Mock referral code validation
    if (referralCode.toUpperCase() === 'FRIEND15' || referralCode.length >= 6) {
      setAppliedDiscount(pricing.referralDiscount);
      toast.success(`$${pricing.referralDiscount} discount applied!`);
    } else {
      toast.error('Invalid referral code');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setStep('complete');
    onOrderComplete?.(orderType);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStep('select');
      setReferralCode('');
      setAppliedDiscount(0);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => o ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Order Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Order Your Book</DialogTitle>
              <DialogDescription>
                Choose your preferred format for "{vaultTitle}"
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RadioGroup value={orderType} onValueChange={(v) => setOrderType(v as 'pdf' | 'print')}>
                {/* PDF Option */}
                <div className={`relative border rounded-lg p-4 cursor-pointer transition-all ${orderType === 'pdf' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <Label htmlFor="pdf" className="flex items-start gap-4 cursor-pointer">
                    <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileDown className="h-4 w-4 text-primary" />
                        <span className="font-medium">Digital PDF</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        High-resolution, print-ready file
                      </p>
                      <p className="font-serif text-xl">${pdfPrice}</p>
                    </div>
                  </Label>
                </div>

                {/* Print Option */}
                <div className={`relative border rounded-lg p-4 cursor-pointer transition-all mt-3 ${orderType === 'print' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <Label htmlFor="print" className="flex items-start gap-4 cursor-pointer">
                    <RadioGroupItem value="print" id="print" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Printed Hardcover</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recommended</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Premium quality, delivered to your door
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-serif text-xl">${printTotal}</p>
                        <p className="text-sm text-muted-foreground">
                          (${printBasePrice} + {pageCount} pages × ${perPagePrice})
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Referral Code */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
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
              <div className="mt-6 flex justify-between items-center py-4 border-t border-border">
                <span className="font-medium">Total</span>
                <div className="text-right">
                  {appliedDiscount > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      ${selectedPrice}
                    </span>
                  )}
                  <span className="font-serif text-2xl">${finalPrice}</span>
                </div>
              </div>

              <Button className="w-full mt-4" size="lg" onClick={() => setStep('payment')}>
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Payment Details</DialogTitle>
              <DialogDescription>
                Sandbox mode - no real charges
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  🧪 <strong>Sandbox Mode:</strong> This is a demo checkout. No payment will be processed.
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

              <div className="py-4 border-t border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">{orderType === 'pdf' ? 'Digital PDF' : 'Printed Hardcover'}</span>
                  <span>${selectedPrice}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
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
                    <>Processing...</>
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

        {step === 'complete' && (
          <>
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="font-serif text-2xl mb-2">Order Confirmed!</DialogTitle>
              <DialogDescription className="mb-6">
                {orderType === 'pdf' 
                  ? 'Your PDF is being prepared and will be ready for download shortly.'
                  : 'Your hardcover book will be printed and shipped within 5-7 business days.'
                }
              </DialogDescription>

              <div className="p-4 bg-muted/50 rounded-lg text-left mb-6">
                <p className="text-sm font-medium mb-1">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="bg-background px-3 py-2 rounded border border-border font-mono">
                    VAULT{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Code copied!')}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this code to give friends ${pricing.referralDiscount} off — you'll earn ${pricing.referralCredit} credit!
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
