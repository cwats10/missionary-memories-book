import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVaults } from '@/hooks/useVaults';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';
import { CreateVaultDialog } from '@/components/dashboard/CreateVaultDialog';
import { VaultCard } from '@/components/dashboard/VaultCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ViewTab = 'owner' | 'manager' | 'contributor';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { ownedVaults, managedVaults, contributedVaults, loading: vaultsLoading, createVault, deleteVault } = useVaults();
  const [activeTab, setActiveTab] = useState<ViewTab>('owner');

  const filteredVaults = useMemo(() => {
    switch (activeTab) {
      case 'owner':
        return ownedVaults;
      case 'manager':
        return managedVaults;
      case 'contributor':
        return contributedVaults;
      default:
        return ownedVaults;
    }
  }, [activeTab, ownedVaults, managedVaults, contributedVaults]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const tabs: { key: ViewTab; label: string; count: number }[] = [
    { key: 'owner', label: 'Owner', count: ownedVaults.length },
    { key: 'manager', label: 'Manager', count: managedVaults.length },
    { key: 'contributor', label: 'Contributor', count: contributedVaults.length },
  ];

  const handleViewVault = (vaultId: string) => {
    navigate(`/vault/${vaultId}`);
  };

  const handleDeleteVault = async (vaultId: string) => {
    await deleteVault(vaultId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <a href="/" className="font-serif text-xl tracking-tight">
              {brandConfig.name}
            </a>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
          {/* Tab Navigation */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2',
                  activeTab === tab.key
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl mb-1">Your Vaults</h1>
              <p className="text-muted-foreground">Create and manage memory books for your loved ones.</p>
            </div>
            {activeTab === 'owner' && <CreateVaultDialog onCreateVault={createVault} />}
          </div>

          {/* Vaults Grid */}
          {vaultsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border border-border rounded-lg">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : filteredVaults.length === 0 ? (
            activeTab === 'owner' ? (
              <EmptyState />
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  {activeTab === 'manager'
                    ? 'You are not a manager on any vaults yet.'
                    : 'You have not been invited to contribute to any vaults yet.'}
                </p>
              </div>
            )
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onDelete={activeTab === 'owner' ? handleDeleteVault : undefined}
                  onView={handleViewVault}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
