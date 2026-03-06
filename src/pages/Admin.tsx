import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminVaultsTab } from '@/components/admin/AdminVaultsTab';
import { AdminTicketsTab } from '@/components/admin/AdminTicketsTab';
import { Shield, Users, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react';

type AdminTab = 'users' | 'vaults' | 'tickets';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading, users, vaults, tickets, exportUsersToCSV, updateUserRole, updateTicket, updateVaultStatus, fetchUsers, fetchVaults, fetchTickets } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs: { key: AdminTab; label: string; icon: typeof Users; count: number }[] = [
    { key: 'users', label: 'Users', icon: Users, count: users.length },
    { key: 'vaults', label: 'Vaults', icon: BookOpen, count: vaults.filter(v => ['submitted', 'in_production'].includes(v.status)).length || vaults.length },
    { key: 'tickets', label: 'Support Tickets', icon: MessageSquare, count: tickets.filter(t => t.status === 'open').length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-serif text-xl tracking-tight">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
          {/* Tab Navigation */}
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
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
                  <Icon className="h-4 w-4" />
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
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'users' && (
            <AdminUsersTab 
              users={users} 
              onExport={exportUsersToCSV}
              onUpdateRole={updateUserRole}
              onRefresh={fetchUsers}
            />
          )}
          {activeTab === 'vaults' && (
            <AdminVaultsTab
              vaults={vaults}
              onRefresh={fetchVaults}
              onUpdateVaultStatus={updateVaultStatus}
            />
          )}
          {activeTab === 'tickets' && (
            <AdminTicketsTab 
              tickets={tickets}
              onUpdateTicket={updateTicket}
              onRefresh={fetchTickets}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
