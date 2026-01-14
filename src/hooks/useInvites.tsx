import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface InviteLink {
  id: string;
  vault_id: string;
  created_by: string;
  code: string;
  role: string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function useInvites(vaultId: string | undefined) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    if (!user || !vaultId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('invite_links')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
    } else {
      setInvites(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, [user, vaultId]);

  const createInvite = async (role: 'coowner' | 'contributor' = 'contributor') => {
    if (!user || !vaultId) return { error: new Error('Not authenticated') };

    // Generate a random 8-character code
    const code = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
      .from('invite_links')
      .insert({
        vault_id: vaultId,
        created_by: user.id,
        code,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite link');
      return { error };
    }

    toast.success('Invite link created!');
    await fetchInvites();
    return { data };
  };

  const deactivateInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('invite_links')
      .update({ is_active: false })
      .eq('id', inviteId);

    if (error) {
      console.error('Error deactivating invite:', error);
      toast.error('Failed to deactivate invite');
      return { error };
    }

    toast.success('Invite link deactivated');
    await fetchInvites();
    return { error: null };
  };

  return {
    invites,
    loading,
    createInvite,
    deactivateInvite,
    refetch: fetchInvites,
  };
}

export async function getInviteByCode(code: string) {
  const { data, error } = await supabase
    .from('invite_links')
    .select(`
      *,
      vaults:vault_id (
        id,
        title,
        recipient_name,
        owner_id
      )
    `)
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  return { data, error };
}

export async function acceptInvite(code: string, userId: string) {
  // Call the secure server-side function
  // Using type assertion since the function was just added
  const { data, error } = await (supabase.rpc as any)('accept_invite', { _code: code });

  if (error) {
    console.error('Error accepting invite:', error);
    
    // Map error messages to user-friendly messages
    if (error.message?.includes('not_authenticated')) {
      return { error: new Error('Please sign in to accept this invite') };
    }
    if (error.message?.includes('invalid_or_expired_invite')) {
      return { error: new Error('This invite link is invalid or has expired') };
    }
    if (error.message?.includes('invalid_invite_role')) {
      return { error: new Error('This invite link is invalid') };
    }
    
    return { error };
  }

  // The function returns an array with one row
  const result = data?.[0];
  
  if (!result) {
    return { error: new Error('Failed to process invite') };
  }

  // Get the full invite details for the success screen
  const { data: inviteData } = await getInviteByCode(code);

  return { 
    data: {
      vault_id: result.vault_id,
      role: result.role,
      vaults: inviteData?.vaults
    }, 
    error: null 
  };
}
