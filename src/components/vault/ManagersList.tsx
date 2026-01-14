import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

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
        {managers.map((manager) => (
          <div
            key={manager.user_id}
            className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full text-sm border border-border"
          >
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {(manager.full_name || manager.email).charAt(0).toUpperCase()}
            </div>
            <span className="text-foreground">
              {manager.full_name || manager.email}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
