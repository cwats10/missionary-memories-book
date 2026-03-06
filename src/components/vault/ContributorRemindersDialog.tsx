import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Copy, Check, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContributorRemindersDialogProps {
  vaultId: string;
  recipientName: string;
}

interface Template {
  id: string;
  label: string;
  description: string;
  icon: string;
  build: (link: string, recipientName: string) => string;
}

const TEMPLATES: Template[] = [
  {
    id: 'invite',
    label: 'Initial Invite',
    description: 'Send when you first share the link',
    icon: '✉️',
    build: (link, recipient) =>
      `Hi! I'm putting together a memory book for ${recipient} — a keepsake of the people and moments that shaped their mission.\n\nI'd love for you to contribute a page. It only takes a few minutes: add a photo, write a short note, or share a memory. The link does all the work for you.\n\n👉 ${link}\n\nThank you so much — this will mean the world to them.`,
  },
  {
    id: 'reminder1',
    label: 'Friendly Reminder',
    description: 'Follow up after 1–2 weeks',
    icon: '🔔',
    build: (link, recipient) =>
      `Hey! Just a friendly reminder — I'm still collecting memories for ${recipient}'s book and would love yours to be in it.\n\nIt takes about 5 minutes. You can add a photo, write a letter, or just share a quick thought.\n\n👉 ${link}\n\nThe book closes soon, so don't miss your chance to be part of it!`,
  },
  {
    id: 'reminder2',
    label: 'Final Call',
    description: 'Last reminder before you close the book',
    icon: '⏰',
    build: (link, recipient) =>
      `Last chance! I'm wrapping up ${recipient}'s memory book very soon.\n\nIf you've been meaning to add something, now is the time — it literally takes 5 minutes and your words will be treasured forever.\n\n👉 ${link}\n\nThank you!`,
  },
  {
    id: 'thankyou',
    label: 'Thank You',
    description: 'After someone contributes',
    icon: '🙏',
    build: (link, recipient) =>
      `Thank you so much for contributing to ${recipient}'s memory book! Your page is received and will be reviewed shortly.\n\nIf you know anyone else who would want to add their memory, feel free to share the link:\n\n👉 ${link}\n\nThis book is going to be something really special.`,
  },
];

export function ContributorRemindersDialog({ vaultId, recipientName }: ContributorRemindersDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [activeTemplateId, setActiveTemplateId] = useState('invite');
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load the permanent invite link
  useEffect(() => {
    if (!open) return;

    const fetchLink = async () => {
      const { data } = await supabase
        .from('invite_links')
        .select('code')
        .eq('vault_id', vaultId)
        .eq('role', 'contributor')
        .is('expires_at', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const base =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://missionary-memories-book.lovable.app';
      const link = data?.code ? `${base}/invite/${data.code}` : `${base}/invite/(generate link first)`;
      setInviteLink(link);

      // Pre-populate editable text for each template
      const initial: Record<string, string> = {};
      TEMPLATES.forEach((t) => {
        initial[t.id] = t.build(link, recipientName);
      });
      setEditedTexts(initial);
    };

    fetchLink();
  }, [open, vaultId, recipientName]);

  const handleCopy = async (templateId: string) => {
    const text = editedTexts[templateId] ?? '';
    await navigator.clipboard.writeText(text);
    setCopiedId(templateId);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId)!;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-stone/30 hover:border-gold/40">
          <Bell className="h-4 w-4" />
          Reminder Messages
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gold" />
            Contributor Messages
          </DialogTitle>
          <DialogDescription>
            Copy-ready messages to invite and remind contributors. Each is editable before copying.
          </DialogDescription>
        </DialogHeader>

        {/* Template picker */}
        <div className="flex flex-wrap gap-2 mt-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTemplateId(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif-text border transition-all',
                activeTemplateId === t.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
              )}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Selected template */}
        <div className="space-y-3 mt-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-sm tracking-wide">{activeTemplate.label}</p>
              <p className="font-serif-text text-xs text-muted-foreground">{activeTemplate.description}</p>
            </div>
            <Button
              size="sm"
              variant={copiedId === activeTemplateId ? 'default' : 'outline'}
              className="gap-1.5 flex-shrink-0"
              onClick={() => handleCopy(activeTemplateId)}
            >
              {copiedId === activeTemplateId ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Message
                </>
              )}
            </Button>
          </div>

          <Textarea
            value={editedTexts[activeTemplateId] ?? ''}
            onChange={(e) =>
              setEditedTexts((prev) => ({ ...prev, [activeTemplateId]: e.target.value }))
            }
            rows={10}
            className="font-serif-text text-sm leading-relaxed resize-none"
          />
          <p className="font-serif-text text-xs text-muted-foreground">
            Edit the message above, then copy it to paste into a text, email, or group chat.
          </p>
        </div>

        {/* Invite link display */}
        {inviteLink && (
          <div className="mt-2 p-3 bg-muted/40 rounded-lg border border-border">
            <p className="font-serif-text text-xs text-muted-foreground mb-1">Your permanent invite link</p>
            <p className="font-mono text-xs text-foreground break-all">{inviteLink}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
