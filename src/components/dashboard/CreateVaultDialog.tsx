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
    recipient_name: '',
    mission_name: '',
    service_start_date: '',
    service_end_date: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await onCreateVault({
      title: 'Mission Memory Vault',
      recipient_name: formData.recipient_name,
      mission_name: formData.mission_name || undefined,
      service_start_date: formData.service_start_date || undefined,
      service_end_date: formData.service_end_date || undefined,
      description: formData.description || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      setFormData({ recipient_name: '', mission_name: '', service_start_date: '', service_end_date: '', description: '' });
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
              Start a Mission Memory Vault for a returning missionary. You can invite contributors later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Missionary Name</Label>
              <Input
                id="recipient"
                placeholder="Elder John Smith"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mission">Mission</Label>
              <Input
                id="mission"
                placeholder="California Los Angeles Mission"
                value={formData.mission_name}
                onChange={(e) => setFormData({ ...formData, mission_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.service_start_date}
                  onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.service_end_date}
                  onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Personal Note (optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief note about this missionary..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
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
