import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, Link2, XCircle } from 'lucide-react';
import { useInvites, InviteLink } from '@/hooks/useInvites';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface InviteDialogProps {
  vaultId: string;
  vaultTitle: string;
}

export function InviteDialog({ vaultId, vaultTitle }: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { invites, loading, createInvite, deactivateInvite } = useInvites(vaultId);

  // Filter to only show active contributor invites
  const activeInvites = invites.filter((inv) => inv.is_active && inv.role === 'contributor');

  const getInviteUrl = (code: string) => {
    // Use the published URL for invite links so they work for external users
    const baseUrl = import.meta.env.PROD 
      ? window.location.origin 
      : 'https://missionary-memories-book.lovable.app';
    return `${baseUrl}/invite/${code}`;
  };

  const copyToClipboard = async (invite: InviteLink) => {
    const url = getInviteUrl(invite.code);
    await navigator.clipboard.writeText(url);
    setCopiedId(invite.id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateInvite = async () => {
    await createInvite('contributor');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Users className="h-4 w-4" />
          Invite Contributor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Invite Contributors</DialogTitle>
          <DialogDescription>
            Share a link with friends and family to let them add memories to "{vaultTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Create New Link */}
          <div className="mb-6">
            <Button onClick={handleCreateInvite} className="w-full gap-2">
              <Link2 className="h-4 w-4" />
              Generate New Invite Link
            </Button>
          </div>

          {/* Active Links */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Active Invite Links ({activeInvites.length})
            </Label>
            
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : activeInvites.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                <p className="text-sm">No active invite links</p>
                <p className="text-xs mt-1">Generate one above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <Input
                        readOnly
                        value={getInviteUrl(invite.code)}
                        className="text-xs bg-background"
                      />
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>Used {invite.uses_count} times</span>
                        <span>•</span>
                        <span>Created {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(invite)}
                      >
                        {copiedId === invite.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deactivateInvite(invite.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
