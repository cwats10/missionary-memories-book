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
  // Get the invite
  const { data: invite, error: fetchError } = await getInviteByCode(code);
  
  if (fetchError || !invite) {
    return { error: new Error('Invalid or expired invite link') };
  }

  // Check if already a contributor
  const { data: existing } = await supabase
    .from('vault_contributors')
    .select('id')
    .eq('vault_id', invite.vault_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { error: new Error('You are already a contributor to this vault') };
  }

  // Add as contributor
  const { error: insertError } = await supabase
    .from('vault_contributors')
    .insert({
      vault_id: invite.vault_id,
      user_id: userId,
      role: invite.role,
      accepted_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('Error accepting invite:', insertError);
    return { error: insertError };
  }

  // Increment uses count
  await supabase
    .from('invite_links')
    .update({ uses_count: invite.uses_count + 1 })
    .eq('id', invite.id);

  return { data: invite, error: null };
}
