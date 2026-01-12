import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vault, VaultType } from './useVaults';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export type UserVaultRole = 'owner' | 'coowner' | 'contributor' | null;

export function useVault(vaultId: string | undefined) {
  const { user } = useAuth();
  const [vault, setVault] = useState<Vault | null>(null);
  const [userRole, setUserRole] = useState<UserVaultRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchVault = useCallback(async () => {
    if (!vaultId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vault:', error);
    }
    
    if (data) {
      setVault({
        ...data,
        vault_type: data.vault_type as VaultType,
      });

      // Determine user's role
      if (user) {
        if (data.owner_id === user.id) {
          setUserRole('owner');
        } else {
          // Check vault_contributors for their role
          const { data: contributor } = await supabase
            .from('vault_contributors')
            .select('role')
            .eq('vault_id', vaultId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (contributor) {
            setUserRole(contributor.role as UserVaultRole);
          } else {
            setUserRole(null);
          }
        }
      }
    } else {
      setVault(null);
      setUserRole(null);
    }
    setLoading(false);
  }, [vaultId, user]);

  const updateVault = useCallback(async (updates: Partial<Vault>) => {
    if (!vaultId) return { error: new Error('No vault ID') };

    const { error } = await supabase
      .from('vaults')
      .update(updates)
      .eq('id', vaultId);

    if (error) {
      console.error('Error updating vault:', error);
      toast.error('Failed to update vault');
      return { error };
    }

    toast.success('Vault updated');
    await fetchVault();
    return { error: null };
  }, [vaultId, fetchVault]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  return { vault, loading, userRole, refetch: fetchVault, updateVault };
}
