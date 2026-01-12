import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { CreateVaultInput } from '@/hooks/useVaults';

interface CreateVaultDialogProps {
  onCreateVault: (input: CreateVaultInput) => Promise<{ error?: Error | null }>;
}

export function CreateVaultDialog({ onCreateVault }: CreateVaultDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    recipient_name: '',
    description: '',
    occasion: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await onCreateVault({
      title: formData.title,
      recipient_name: formData.recipient_name,
      description: formData.description || undefined,
      occasion: formData.occasion || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      setFormData({ title: '', recipient_name: '', description: '', occasion: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Create a New Vault</DialogTitle>
            <DialogDescription>
              Start a memory book for someone special. You can invite contributors later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Vault Title</Label>
              <Input
                id="title"
                placeholder="Elder Smith's Mission Memories"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                placeholder="Elder John Smith"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <Input
                id="occasion"
                placeholder="Mission Homecoming, Graduation, etc."
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief description of this memory vault..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vault'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
