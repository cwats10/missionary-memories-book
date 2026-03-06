import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface ContributorWelcomeBannerProps {
  recipientName: string;
  onAddMemory: () => void;
}

export function ContributorWelcomeBanner({ recipientName, onAddMemory }: ContributorWelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mb-8 p-6 rounded-lg border border-gold/30 bg-gold/5 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg mb-1">
            You're invited to contribute to {recipientName}'s memory book
          </h3>
          <p className="text-sm text-muted-foreground">
            Share a photo, write a letter, or tell a story about the impact{' '}
            {recipientName} has had in your life. Your contribution will be
            reviewed and included in a printed keepsake book.
          </p>
        </div>
        <Button
          onClick={onAddMemory}
          className="flex-shrink-0 font-serif"
        >
          Add My Memory
        </Button>
      </div>
    </div>
  );
}
