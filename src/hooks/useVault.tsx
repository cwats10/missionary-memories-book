import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vault, VaultType } from './useVaults';

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

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  return { vault, loading, refetch: fetchVault };
}
