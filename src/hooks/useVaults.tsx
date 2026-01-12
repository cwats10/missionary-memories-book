import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Vault {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  recipient_name: string;
  occasion: string | null;
  status: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVaultInput {
  title: string;
  recipient_name: string;
  description?: string;
  occasion?: string;
}

export function useVaults() {
  const { user } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVaults = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vaults:', error);
      toast.error('Failed to load vaults');
    } else {
      setVaults(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVaults();
  }, [user]);

  const createVault = async (input: CreateVaultInput) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('vaults')
      .insert({
        owner_id: user.id,
        title: input.title,
        recipient_name: input.recipient_name,
        description: input.description || null,
        occasion: input.occasion || null,
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
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId);

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
    loading,
    createVault,
    deleteVault,
    refetch: fetchVaults,
  };
}
