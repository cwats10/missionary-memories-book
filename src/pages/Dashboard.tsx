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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="absolute inset-0 paper-texture pointer-events-none" />
        <LoadingSpinner message="Loading..." />
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
    <div className="min-h-screen bg-background relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      {/* Header with refined styling */}
      <header className="border-b border-stone/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <a href="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
              {brandConfig.name}
            </a>
            <div className="flex items-center gap-4">
              <span className="text-sm font-serif-text text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" className="border-stone/30 hover:border-gold/40" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Tab Navigation with gold accent */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-5 py-3 text-sm font-serif transition-all duration-300 border-b-2 -mb-px flex items-center gap-2',
                  activeTab === tab.key
                    ? 'border-gold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-stone/30'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full transition-all duration-300',
                    activeTab === tab.key 
                      ? 'bg-gold/15 text-gold' 
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
          {/* Gold accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="px-6 py-14 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Page Header with refined typography */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl mb-2 tracking-wide">Your Vaults</h1>
              <p className="font-serif-text text-muted-foreground">Create and manage memory books for your loved ones.</p>
            </div>
            {activeTab === 'owner' && <CreateVaultDialog onCreateVault={createVault} />}
          </div>

          {/* Vaults Grid with refined skeleton */}
          {vaultsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border border-stone/20 rounded-lg shadow-elegant bg-card">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-5" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : filteredVaults.length === 0 ? (
            activeTab === 'owner' ? (
              <EmptyState />
            ) : (
              <div className="text-center py-20 border border-dashed border-stone/30 rounded-lg bg-card/30">
                <p className="font-serif-text text-muted-foreground">
                  {activeTab === 'manager'
                    ? 'You are not a manager on any vaults yet.'
                    : 'You have not been invited to contribute to any vaults yet.'}
                </p>
              </div>
            )
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
