import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type VaultType = 'farewell' | 'homecoming' | 'returned';

export interface Vault {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  recipient_name: string;
  mission_name: string | null;
  service_start_date: string | null;
  service_end_date: string | null;
  occasion: string | null;
  status: string;
  cover_image_url: string | null;
  vault_type: VaultType;
  created_at: string;
  updated_at: string;
}

export type VaultRole = 'owner' | 'coowner' | 'contributor';

export interface VaultWithRole extends Vault {
  userRole: VaultRole;
}

export interface CreateVaultInput {
  title: string;
  recipient_name: string;
  mission_name?: string;
  service_start_date?: string;
  service_end_date?: string;
  description?: string;
  occasion?: string;
  vault_type: VaultType;
}

export function useVaults() {
  const { user } = useAuth();
  const [vaults, setVaults] = useState<VaultWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch vaults user owns
    const { data: ownedVaults, error: ownedError } = await supabase
      .from('vaults')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedError) {
      console.error('Error fetching owned vaults:', ownedError);
      toast.error('Failed to load vaults');
      setLoading(false);
      return;
    }

    // Fetch vaults user is a contributor/coowner on
    const { data: contributorRecords, error: contribError } = await supabase
      .from('vault_contributors')
      .select('vault_id, role')
      .eq('user_id', user.id);

    if (contribError) {
      console.error('Error fetching contributor records:', contribError);
    }

    // Fetch contributed vault details
    let contributedVaults: Vault[] = [];
    const contributorMap = new Map<string, VaultRole>();

    if (contributorRecords && contributorRecords.length > 0) {
      contributorRecords.forEach((rec) => {
        contributorMap.set(rec.vault_id, rec.role as VaultRole);
      });

      const vaultIds = contributorRecords.map((r) => r.vault_id);
      const { data: contribVaults, error: contribVaultsError } = await supabase
        .from('vaults')
        .select('*')
        .in('id', vaultIds)
        .order('created_at', { ascending: false });

      if (contribVaultsError) {
        console.error('Error fetching contributed vaults:', contribVaultsError);
      } else {
        contributedVaults = (contribVaults || []).map((v) => ({
          ...v,
          vault_type: v.vault_type as VaultType,
        }));
      }
    }

    // Combine, deduplicating and assigning roles
    const ownedIds = new Set((ownedVaults || []).map((v) => v.id));

    const ownedWithRole: VaultWithRole[] = (ownedVaults || []).map((v) => ({
      ...v,
      vault_type: v.vault_type as VaultType,
      userRole: 'owner' as VaultRole,
    }));

    const contribWithRole: VaultWithRole[] = contributedVaults
      .filter((v) => !ownedIds.has(v.id)) // exclude if user also owns it
      .map((v) => ({
        ...v,
        userRole: contributorMap.get(v.id) || 'contributor',
      }));

    setVaults([...ownedWithRole, ...contribWithRole]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVaults();
  }, [user]);

  // Filtered lists by role
  const ownedVaults = useMemo(() => vaults.filter((v) => v.userRole === 'owner'), [vaults]);
  const managedVaults = useMemo(() => vaults.filter((v) => v.userRole === 'coowner'), [vaults]);
  const contributedVaults = useMemo(() => vaults.filter((v) => v.userRole === 'contributor'), [vaults]);

  const createVault = async (input: CreateVaultInput) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('vaults')
      .insert({
        owner_id: user.id,
        title: input.title,
        recipient_name: input.recipient_name,
        mission_name: input.mission_name || null,
        service_start_date: input.service_start_date || null,
        service_end_date: input.service_end_date || null,
        description: input.description || null,
        occasion: input.occasion || null,
        vault_type: input.vault_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vault:', error);
      toast.error('Failed to create vault');
      return { error };
    }

    toast.success('Vault created successfully!');
    await fetchVaults();
    return { data };
  };

  const deleteVault = async (vaultId: string) => {
    const { error } = await supabase.from('vaults').delete().eq('id', vaultId);

    if (error) {
      console.error('Error deleting vault:', error);
      toast.error('Failed to delete vault');
      return { error };
    }

    toast.success('Vault deleted');
    await fetchVaults();
    return { error: null };
  };

  return {
    vaults,
    ownedVaults,
    managedVaults,
    contributedVaults,
    loading,
    createVault,
    deleteVault,
    refetch: fetchVaults,
  };
}
