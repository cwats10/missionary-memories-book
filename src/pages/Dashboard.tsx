import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';

const Dashboard = () => {
  const { user, loading, roles, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getRoleLabel = () => {
    if (roles.includes('owner')) return 'Owner';
    if (roles.includes('coowner')) return 'Co-owner';
    if (roles.includes('contributor')) return 'Contributor';
    return 'Member';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif text-xl tracking-tight">
            {brandConfig.name}
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {getRoleLabel()}
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
      </header>

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl mb-4">
            Welcome to Your Memory Vault
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            This is where you'll manage your memory books, invite contributors, and bring your stories to life.
          </p>

          {/* Placeholder for future features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-8 border border-border rounded-lg bg-card">
              <h3 className="font-serif text-xl mb-2">Create a Vault</h3>
              <p className="text-muted-foreground text-sm">
                Start a new memory book for a missionary, graduate, or special occasion.
              </p>
            </div>
            <div className="p-8 border border-border rounded-lg bg-card">
              <h3 className="font-serif text-xl mb-2">Invite Contributors</h3>
              <p className="text-muted-foreground text-sm">
                Share a link with friends and family to collect their messages.
              </p>
            </div>
            <div className="p-8 border border-border rounded-lg bg-card">
              <h3 className="font-serif text-xl mb-2">Order Prints</h3>
              <p className="text-muted-foreground text-sm">
                Turn your digital memories into a beautiful printed keepsake.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
