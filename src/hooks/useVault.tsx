import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vault, VaultType } from './useVaults';
import { toast } from 'sonner';

export function useVault(vaultId: string | undefined) {
  const [vault, setVault] = useState<Vault | null>(null);
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
    } else {
      setVault(null);
    }
    setLoading(false);
  }, [vaultId]);

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

  return { vault, loading, refetch: fetchVault, updateVault };
}
