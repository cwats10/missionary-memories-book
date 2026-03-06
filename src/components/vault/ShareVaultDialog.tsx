import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check, Link, Infinity, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ShareVaultDialogProps {
  vaultId: string;
  recipientName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PermanentInvite {
  id: string;
  code: string;
  uses_count: number;
}

export function ShareVaultDialog({ vaultId, recipientName, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ShareVaultDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    controlledOnOpenChange?.(v);
  };
  const [invite, setInvite] = useState<PermanentInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const getShareUrl = (code: string) => {
    const base = import.meta.env.PROD
      ? window.location.origin
      : 'https://missionary-memories-book.lovable.app';
    return `${base}/invite/${code}`;
  };

  const fetchOrCreatePermanentLink = async () => {
    if (!user || !vaultId) return;
    setLoading(true);

    // Try to find an existing permanent (no expiry) contributor link
    const { data: existing } = await supabase
      .from('invite_links')
      .select('id, code, uses_count')
      .eq('vault_id', vaultId)
      .eq('role', 'contributor')
      .eq('is_active', true)
      .is('expires_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setInvite(existing);
      setLoading(false);
      return;
    }

    // Create a permanent link
    const code = Math.random().toString(36).substring(2, 10);
    const { data: created, error } = await supabase
      .from('invite_links')
      .insert({
        vault_id: vaultId,
        created_by: user.id,
        code,
        role: 'contributor',
        expires_at: null, // permanent
        max_uses: null,   // unlimited uses
      })
      .select('id, code, uses_count')
      .single();

    if (error) {
      console.error('Error creating permanent invite:', error);
      toast.error('Failed to create share link');
    } else {
      setInvite(created);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchOrCreatePermanentLink();
  }, [open, vaultId, user]);

  const copyLink = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(getShareUrl(invite.code));
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateLink = async () => {
    if (!user || !vaultId || !invite) return;

    // Deactivate the old link
    await supabase
      .from('invite_links')
      .update({ is_active: false })
      .eq('id', invite.id);

    setInvite(null);
    await fetchOrCreatePermanentLink();
    toast.success('New link generated');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share & Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Share Your Book</DialogTitle>
          <DialogDescription>
            Send this link to anyone you'd like to contribute memories for{' '}
            <strong>{recipientName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Permanent Link Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 text-xs border-green-500/40 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
              <Infinity className="h-3 w-3" />
              Permanent Link
            </Badge>
            <span className="text-xs text-muted-foreground">
              This link never expires
            </span>
          </div>

          {/* Link display */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  readOnly
                  value={invite ? getShareUrl(invite.code) : loading ? 'Generating…' : ''}
                  className="pl-9 text-sm font-mono bg-muted/30"
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={copyLink}
                disabled={!invite}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {invite && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Used <strong>{invite.uses_count}</strong> {invite.uses_count === 1 ? 'time' : 'times'}
              </p>
            )}
          </div>

          {/* Copy button (larger, primary) */}
          <Button
            className="w-full gap-2"
            onClick={copyLink}
            disabled={!invite}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Invite Link
              </>
            )}
          </Button>

          {/* What contributors will see */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-2">What contributors experience:</h4>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">1</span>
                They click the link and sign in (or create a free account)
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">2</span>
                They choose how to contribute: photo, letter, or story
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">3</span>
                Their entry is submitted for your review and approval
              </li>
            </ol>
          </div>

          {/* Regenerate link */}
          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1.5 text-xs"
              onClick={regenerateLink}
              disabled={loading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate a new link (deactivates current)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
