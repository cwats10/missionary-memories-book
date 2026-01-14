import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Manager {
  user_id: string;
  full_name: string | null;
  email: string;
}

interface ManagersListProps {
  vaultId: string;
}

export function ManagersList({ vaultId }: ManagersListProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      
      // Get all coowners for this vault
      const { data: contributors, error: contributorsError } = await supabase
        .from('vault_contributors')
        .select('user_id')
        .eq('vault_id', vaultId)
        .eq('role', 'coowner');

      if (contributorsError) {
        console.error('Error fetching managers:', contributorsError);
        setLoading(false);
        return;
      }

      if (!contributors || contributors.length === 0) {
        setManagers([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these users
      const userIds = contributors.map(c => c.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching manager profiles:', profilesError);
        setLoading(false);
        return;
      }

      setManagers(profiles || []);
      setLoading(false);
    };

    fetchManagers();
  }, [vaultId]);

  const handleRemoveManager = async (userId: string, displayName: string) => {
    const { error } = await supabase
      .from('vault_contributors')
      .delete()
      .eq('vault_id', vaultId)
      .eq('user_id', userId)
      .eq('role', 'coowner');

    if (error) {
      console.error('Error removing manager:', error);
      toast.error('Failed to remove manager');
      return;
    }

    setManagers(prev => prev.filter(m => m.user_id !== userId));
    toast.success(`${displayName} has been removed as a manager`);
  };

  if (loading) {
    return null;
  }

  if (managers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Vault Managers ({managers.length})</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {managers.map((manager) => {
          const displayName = manager.full_name || manager.email;
          return (
            <div
              key={manager.user_id}
              className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full text-sm border border-border"
            >
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-foreground">{displayName}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive -mr-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Manager</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove <strong>{displayName}</strong> as a manager? 
                      They will no longer be able to manage this vault.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemoveManager(manager.user_id, displayName)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        })}
      </div>
    </div>
  );
}
