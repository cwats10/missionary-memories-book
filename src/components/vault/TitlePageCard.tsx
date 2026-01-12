import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Vault } from '@/hooks/useVaults';

interface TitlePageCardProps {
  vault: Vault;
  isOwner: boolean;
  onUpdate: () => void;
}

export function TitlePageCard({ vault, isOwner, onUpdate }: TitlePageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: vault.recipient_name,
    mission_name: vault.mission_name || '',
    service_start_date: vault.service_start_date || '',
    service_end_date: vault.service_end_date || '',
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleSave = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('vaults')
      .update({
        recipient_name: formData.recipient_name,
        mission_name: formData.mission_name || null,
        service_start_date: formData.service_start_date || null,
        service_end_date: formData.service_end_date || null,
      })
      .eq('id', vault.id);

    setLoading(false);

    if (error) {
      console.error('Error updating vault:', error);
      toast.error('Failed to update title page');
      return;
    }

    toast.success('Title page updated');
    setIsEditing(false);
    onUpdate();
  };

  return (
    <>
      <div 
        className="relative border border-border rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => isOwner && setIsEditing(true)}
        style={{ backgroundColor: '#F4F1EC' }}
      >
        {/* Page Preview */}
        <div className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
          <p 
            className="text-sm tracking-widest uppercase mb-4 opacity-60"
            style={{ color: '#2B2B2A', fontFamily: '"DM Serif Display", serif' }}
          >
            Title Page
          </p>
          <h3 
            className="text-2xl md:text-3xl mb-3"
            style={{ color: '#2B2B2A', fontFamily: '"DM Serif Display", serif' }}
          >
            {vault.recipient_name}
          </h3>
          {vault.mission_name && (
            <p 
              className="text-base mb-1"
              style={{ color: '#2B2B2A', fontFamily: '"DM Serif Display", serif', opacity: 0.8 }}
            >
              {vault.mission_name}
            </p>
          )}
          {(vault.service_start_date || vault.service_end_date) && (
            <p 
              className="text-sm"
              style={{ color: '#2B2B2A', fontFamily: '"DM Serif Display", serif', opacity: 0.7 }}
            >
              {formatDate(vault.service_start_date)} — {formatDate(vault.service_end_date)}
            </p>
          )}
        </div>

        {/* Edit overlay */}
        {isOwner && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-background border border-border rounded-full p-2 shadow-sm">
              <Edit2 className="h-4 w-4 text-foreground" />
            </div>
          </div>
        )}

        {/* Page number indicator */}
        <div 
          className="absolute bottom-2 right-3 text-xs"
          style={{ color: '#2B2B2A', opacity: 0.5 }}
        >
          Page 1
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit Title Page</DialogTitle>
            <DialogDescription>
              Update the missionary information that appears on the first page of the book.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_recipient">Missionary Name</Label>
              <Input
                id="edit_recipient"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_mission">Mission</Label>
              <Input
                id="edit_mission"
                value={formData.mission_name}
                onChange={(e) => setFormData({ ...formData, mission_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.service_start_date}
                  onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.service_end_date}
                  onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.recipient_name}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
