import { useState } from 'react';
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
  const { vaults, loading: vaultsLoading, createVault, deleteVault } = useVaults();
  const [activeTab, setActiveTab] = useState<ViewTab>('owner');

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

  const tabs: { key: ViewTab; label: string }[] = [
    { key: 'owner', label: 'Owner' },
    { key: 'manager', label: 'Manager' },
    { key: 'contributor', label: 'Contributor' },
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
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
          {/* Tab Navigation */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.label}
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
              <p className="text-muted-foreground">
                Create and manage memory books for your loved ones.
              </p>
            </div>
            <CreateVaultDialog onCreateVault={createVault} />
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
          ) : vaults.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onDelete={handleDeleteVault}
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
