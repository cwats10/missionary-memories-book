import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Gift } from 'lucide-react';

interface ThankYouDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
}

export function ThankYouDialog({ open, onOpenChange, recipientName }: ThankYouDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-serif text-2xl">Thank You!</DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            Thank you for contributing to <span className="font-medium text-foreground">{recipientName}'s</span> vault. 
            You've helped make memories last!
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-2">
                We would love to help you create lasting memories for the missionaries in your life too!
              </p>
              <p>
                Ask the owner of this vault for a referral code to get <span className="font-semibold text-foreground">$15 off</span> your order — 
                and they'll receive a <span className="font-semibold text-foreground">$15 credit</span> as well.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={() => window.open('/', '_blank')}
            className="w-full"
          >
            Learn More
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
