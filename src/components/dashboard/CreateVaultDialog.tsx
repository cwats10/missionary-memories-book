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
import { Plus, Check } from 'lucide-react';
import { CreateVaultInput, VaultType } from '@/hooks/useVaults';
import { brandConfig } from '@/config/brandConfig';
import { cn } from '@/lib/utils';

interface CreateVaultDialogProps {
  onCreateVault: (input: CreateVaultInput) => Promise<{ error?: Error | null }>;
}

const vaultTypes: { type: VaultType; name: string; color: string; textColor: string }[] = [
  {
    type: 'farewell',
    name: 'Farewell Vault',
    color: brandConfig.colors.boneParchment.hex,
    textColor: brandConfig.colors.deepCharcoal.hex,
  },
  {
    type: 'homecoming',
    name: 'Homecoming Vault',
    color: brandConfig.colors.deepForest.hex,
    textColor: '#F4F1EC',
  },
  {
    type: 'returned',
    name: 'Returned Missionary Vault',
    color: brandConfig.colors.deepCharcoal.hex,
    textColor: '#F4F1EC',
  },
];

export function CreateVaultDialog({ onCreateVault }: CreateVaultDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vault_type: 'farewell' as VaultType,
    recipient_name: '',
    mission_name: '',
    service_start_date: '',
    service_end_date: '',
    description: '',
    contributor_page_limit: 1,
  });

  const handleTypeSelect = (type: VaultType) => {
    setFormData({ ...formData, vault_type: type });
    setStep('details');
  };

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
      vault_type: formData.vault_type,
      contributor_page_limit: formData.contributor_page_limit,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      setStep('type');
      setFormData({
        vault_type: 'farewell',
        recipient_name: '',
        mission_name: '',
        service_start_date: '',
        service_end_date: '',
        description: '',
        contributor_page_limit: 1,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep('type');
    }
  };

  const selectedType = vaultTypes.find((v) => v.type === formData.vault_type);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'type' ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Choose Your Vault</DialogTitle>
              <DialogDescription>
                Select the type of memory vault you'd like to create.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              {vaultTypes.map((vault) => (
                <button
                  key={vault.type}
                  type="button"
                  onClick={() => handleTypeSelect(vault.type)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md text-left",
                    formData.vault_type === vault.type
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {/* Book cover preview */}
                  <div
                    className="w-16 h-20 rounded flex items-center justify-center shadow-sm flex-shrink-0 px-2"
                    style={{ backgroundColor: vault.color }}
                  >
                    <span
                      className="text-[5px] font-serif text-center leading-tight"
                      style={{ color: vault.textColor }}
                    >
                      Mission Memory Vault
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-foreground">{vault.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vault.type === 'farewell' && 'For missionaries about to leave on their mission.'}
                      {vault.type === 'homecoming' && 'For missionaries returning home from their mission.'}
                      {vault.type === 'returned' && 'For celebrating a completed mission journey.'}
                    </p>
                  </div>

                  {formData.vault_type === vault.type && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl flex items-center gap-3">
                <div
                  className="w-8 h-10 rounded flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: selectedType?.color }}
                >
                  <span
                    className="text-[4px] font-serif text-center px-0.5 leading-tight"
                    style={{ color: selectedType?.textColor }}
                  >
                    Mission Memory Vault
                  </span>
                </div>
                {selectedType?.name}
              </DialogTitle>
              <DialogDescription>
                Enter the details for this memory vault.
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
              
              {/* Contributor Page Limit */}
              <div className="grid gap-2">
                <Label>How many pages can each contributor create?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, contributor_page_limit: num })}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all",
                        formData.contributor_page_limit === num
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Contributors will be able to create up to {formData.contributor_page_limit} {formData.contributor_page_limit === 1 ? 'page' : 'pages'} each.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('type')}>
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Vault'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
