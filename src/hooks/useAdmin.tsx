import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
  vault_count: number;
  page_count: number;
}

export interface AdminVault {
  id: string;
  title: string;
  recipient_name: string;
  vault_type: string;
  status: string;
  created_at: string;
  owner_email: string;
  contributor_count: number;
  page_count: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user_email?: string;
  user_name?: string;
}

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vaults, setVaults] = useState<AdminVault[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait until auth has finished initializing, otherwise we can incorrectly
      // redirect away from /admin before the session is hydrated.
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Admin check failed:', error);
        toast.error('Unable to verify admin access.');
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user, authLoading]);

  // Fetch all users with their data
  const fetchUsers = async () => {
    if (!isAdmin) return;

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Failed to fetch users');
      return;
    }

    // Fetch roles for all users
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    // Fetch vault counts (owned)
    const { data: vaultCounts } = await supabase
      .from('vaults')
      .select('owner_id');

    // Fetch page counts
    const { data: pageCounts } = await supabase
      .from('pages')
      .select('contributor_id');

    const usersWithData: AdminUser[] = (profiles || []).map(profile => {
      const userRoles = roles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [];
      const vaultCount = vaultCounts?.filter(v => v.owner_id === profile.user_id).length || 0;
      const pageCount = pageCounts?.filter(p => p.contributor_id === profile.user_id).length || 0;

      return {
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        roles: userRoles,
        vault_count: vaultCount,
        page_count: pageCount,
      };
    });

    setUsers(usersWithData);
  };

  // Fetch all vaults with owner info
  const fetchVaults = async () => {
    if (!isAdmin) return;

    const { data: vaultsData, error: vaultsError } = await supabase
      .from('vaults')
      .select('*')
      .order('created_at', { ascending: false });

    if (vaultsError) {
      toast.error('Failed to fetch vaults');
      return;
    }

    // Get owner profiles
    const ownerIds = [...new Set(vaultsData?.map(v => v.owner_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', ownerIds);

    // Get contributor counts
    const { data: contributors } = await supabase
      .from('vault_contributors')
      .select('vault_id');

    // Get page counts
    const { data: pages } = await supabase
      .from('pages')
      .select('vault_id');

    const vaultsWithData: AdminVault[] = (vaultsData || []).map(vault => {
      const ownerProfile = profiles?.find(p => p.user_id === vault.owner_id);
      const contributorCount = contributors?.filter(c => c.vault_id === vault.id).length || 0;
      const pageCount = pages?.filter(p => p.vault_id === vault.id).length || 0;

      return {
        id: vault.id,
        title: vault.title,
        recipient_name: vault.recipient_name,
        vault_type: vault.vault_type,
        status: vault.status,
        created_at: vault.created_at,
        owner_email: ownerProfile?.email || 'Unknown',
        contributor_count: contributorCount,
        page_count: pageCount,
      };
    });

    setVaults(vaultsWithData);
  };

  // Fetch support tickets
  const fetchTickets = async () => {
    if (!isAdmin) return;

    const { data: ticketsData, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsError) {
      toast.error('Failed to fetch tickets');
      return;
    }

    // Get user profiles for tickets
    const userIds = [...new Set(ticketsData?.map(t => t.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', userIds);

    const ticketsWithUsers: SupportTicket[] = (ticketsData || []).map(ticket => {
      const userProfile = profiles?.find(p => p.user_id === ticket.user_id);
      return {
        ...ticket,
        user_email: userProfile?.email,
        user_name: userProfile?.full_name || undefined,
      };
    });

    setTickets(ticketsWithUsers);
  };

  // Update user role
  const updateUserRole = async (userId: string, role: 'admin' | 'owner' | 'coowner' | 'contributor', action: 'add' | 'remove') => {
    if (action === 'add') {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) {
        toast.error('Failed to add role');
        return false;
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) {
        toast.error('Failed to remove role');
        return false;
      }
    }

    toast.success(`Role ${action === 'add' ? 'added' : 'removed'} successfully`);
    await fetchUsers();
    return true;
  };

  // Update ticket status/response
  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        ...updates,
        responded_by: user?.id,
        resolved_at: updates.status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', ticketId);

    if (error) {
      toast.error('Failed to update ticket');
      return false;
    }

    toast.success('Ticket updated successfully');
    await fetchTickets();
    return true;
  };

  // Update a vault's fulfillment status (admin only)
  const updateVaultStatus = async (vaultId: string, status: string) => {
    const { error } = await supabase
      .from('vaults')
      .update({ status })
      .eq('id', vaultId);

    if (error) {
      toast.error('Failed to update vault status');
      return false;
    }

    toast.success('Vault status updated');
    await fetchVaults();
    return true;
  };

  // Delete user (remove from profiles - cascades)
  const deleteUser = async (userId: string) => {
    // Note: This requires admin to have delete permissions or use service role
    toast.error('User deletion requires backend admin access');
    return false;
  };

  // Export users to CSV
  const exportUsersToCSV = () => {
    const headers = ['Email', 'Full Name', 'Roles', 'Vaults Owned', 'Pages Created', 'Joined'];
    const rows = users.map(u => [
      u.email,
      u.full_name || '',
      u.roles.join('; '),
      u.vault_count.toString(),
      u.page_count.toString(),
      new Date(u.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Users exported successfully');
  };

  // Fetch all data when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchVaults();
      fetchTickets();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    loading,
    users,
    vaults,
    tickets,
    fetchUsers,
    fetchVaults,
    fetchTickets,
    updateUserRole,
    updateTicket,
    updateVaultStatus,
    deleteUser,
    exportUsersToCSV,
  };
};
