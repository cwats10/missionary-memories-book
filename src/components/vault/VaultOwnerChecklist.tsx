import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Share2,
  Users,
  ThumbsUp,
  GripVertical,
  Eye,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChecklistStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tip?: string;
  actionLabel?: string;
  onAction?: () => void;
  complete: boolean;
}

interface VaultOwnerChecklistProps {
  vaultId: string;
  recipientName: string;
  totalPages: number;
  approvedPages: number;
  vaultPurchased: boolean;
  onShareClick: () => void;
  onPreviewClick: () => void;
  onOrderClick: () => void;
}

const DISMISSED_KEY = (vaultId: string) => `checklist-dismissed-${vaultId}`;
const SHARED_KEY = (vaultId: string) => `checklist-shared-${vaultId}`;

export function VaultOwnerChecklist({
  vaultId,
  recipientName,
  totalPages,
  approvedPages,
  vaultPurchased,
  onShareClick,
  onPreviewClick,
  onOrderClick,
}: VaultOwnerChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY(vaultId)) === 'true');
    setHasShared(localStorage.getItem(SHARED_KEY(vaultId)) === 'true');
  }, [vaultId]);

  const markShared = () => {
    localStorage.setItem(SHARED_KEY(vaultId), 'true');
    setHasShared(true);
    onShareClick();
  };

  const steps: ChecklistStep[] = [
    {
      id: 'created',
      icon: CheckCircle2,
      title: 'Vault created',
      description: `Your memory book for ${recipientName} is ready to collect contributions.`,
      complete: true,
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share your invite link',
      description: 'Send one permanent link to everyone you want to contribute — no accounts needed to view it.',
      tip: 'Send it in a group text, email, or family chat. The same link works for everyone.',
      actionLabel: 'Copy Link',
      onAction: markShared,
      complete: hasShared || totalPages > 0,
    },
    {
      id: 'contributions',
      icon: Users,
      title: 'Receive contributions',
      description: `Wait for friends and family to add their memories. Each person can add up to a set number of pages.`,
      tip: 'Contributors choose from three formats: photo + message, letter, or full-page photo.',
      complete: totalPages > 0,
    },
    {
      id: 'approve',
      icon: ThumbsUp,
      title: 'Review and approve pages',
      description: 'Read each contribution. Tap Approve to include it in the book, or Reject to exclude it.',
      tip: 'Only approved pages appear in the final PDF and print. You can un-approve anytime before ordering.',
      actionLabel: approvedPages === 0 && totalPages > 0 ? 'Review Now ↓' : undefined,
      onAction: approvedPages === 0 && totalPages > 0
        ? () => document.querySelector('#pages-section')?.scrollIntoView({ behavior: 'smooth' })
        : undefined,
      complete: approvedPages > 0,
    },
    {
      id: 'arrange',
      icon: GripVertical,
      title: 'Arrange your pages',
      description: 'Drag approved pages into the order you want them to appear in the book.',
      tip: 'The title page is always first. After that, you choose the sequence.',
      complete: approvedPages >= 2,
    },
    {
      id: 'preview',
      icon: Eye,
      title: 'Preview your book',
      description: 'Open the book preview to see exactly how every page will look when printed.',
      tip: 'Use the preview to catch any spacing or layout issues before ordering.',
      actionLabel: approvedPages > 0 ? 'Open Preview' : undefined,
      onAction: approvedPages > 0 ? onPreviewClick : undefined,
      complete: vaultPurchased,
    },
    {
      id: 'order',
      icon: ShoppingCart,
      title: 'Order or download',
      description: 'Download a print-ready PDF, or order a premium hardcover delivered to your door.',
      tip: 'Hardcover orders ship via Lulu Direct in 5–7 business days. The PDF is instant.',
      actionLabel: !vaultPurchased && approvedPages > 0 ? 'Order Now' : undefined,
      onAction: !vaultPurchased && approvedPages > 0 ? onOrderClick : undefined,
      complete: vaultPurchased,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  // Find the first incomplete step
  const activeIndex = steps.findIndex((s) => !s.complete);

  if (dismissed) return null;

  return (
    <div className="mb-8 border border-gold/25 rounded-lg overflow-hidden bg-card/60 shadow-elegant">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {allDone ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                  <circle
                    cx="10" cy="10" r="8"
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - progressPct / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-serif-text text-[8px] text-foreground">
                  {completedCount}
                </span>
              </div>
            )}
            <span className="font-serif text-sm tracking-wide">
              {allDone ? 'Your book is ready!' : 'Getting Started'}
            </span>
          </div>
          <span className="font-serif-text text-xs text-muted-foreground">
            {allDone
              ? 'All steps complete — time to order.'
              : `${completedCount} of ${steps.length} steps complete`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:block w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold/70 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="border-t border-gold/10">
          <ol className="divide-y divide-border/50">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeIndex;
              const isFuture = !step.complete && i > activeIndex;

              return (
                <li
                  key={step.id}
                  className={cn(
                    'px-5 py-4 transition-colors',
                    isActive && 'bg-gold/5',
                    isFuture && 'opacity-50',
                    step.complete && 'opacity-70',
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {step.complete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : isActive ? (
                        <div className="h-5 w-5 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn('h-4 w-4', step.complete ? 'text-green-600' : isActive ? 'text-gold' : 'text-muted-foreground/50')} />
                          <span className={cn(
                            'font-serif text-sm tracking-wide',
                            step.complete ? 'line-through text-muted-foreground' : isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {step.title}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.5 bg-gold/15 text-gold rounded-full font-serif-text tracking-wide">
                              Next step
                            </span>
                          )}
                        </div>

                        {step.actionLabel && step.onAction && !step.complete && (
                          <Button
                            size="sm"
                            variant={isActive ? 'default' : 'outline'}
                            className="gap-1.5 text-xs h-7 flex-shrink-0"
                            onClick={step.onAction}
                          >
                            {step.actionLabel}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="font-serif-text text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Tip — only show for the active step */}
                      {isActive && step.tip && (
                        <div className="mt-2.5 flex items-start gap-2 px-3 py-2 bg-background/60 rounded border border-gold/15">
                          <span className="text-gold/60 text-[10px] mt-0.5 flex-shrink-0">✦</span>
                          <p className="font-serif-text text-xs text-muted-foreground italic">
                            {step.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gold/10 flex items-center justify-between bg-muted/20">
            <p className="font-serif-text text-xs text-muted-foreground/60 italic">
              This guide updates automatically as you complete each step.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(DISMISSED_KEY(vaultId), 'true');
                setDismissed(true);
              }}
              className="font-serif-text text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
