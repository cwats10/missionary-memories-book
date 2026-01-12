import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vault } from './useVaults';

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
    
    setVault(data);
    setLoading(false);
  }, [vaultId]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  return { vault, loading, refetch: fetchVault };
}
