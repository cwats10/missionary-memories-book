import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVault } from '@/hooks/useVault';
import { usePages } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';
import { CreatePageDialog } from '@/components/vault/CreatePageDialog';
import { PageCard } from '@/components/vault/PageCard';
import { InviteDialog } from '@/components/vault/InviteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Settings } from 'lucide-react';

const VaultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { vault, loading: vaultLoading } = useVault(id);
  const { pages, loading: pagesLoading, createPage, deletePage } = usePages(id);

  if (authLoading || vaultLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="font-serif text-2xl mb-2">Vault not found</h1>
        <p className="text-muted-foreground mb-6">This vault doesn't exist or you don't have access.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif text-xl tracking-tight">
            {brandConfig.name}
          </a>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Vaults
          </Button>

          {/* Vault Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-3xl mb-1">{vault.title}</h1>
                <p className="text-muted-foreground">
                  For {vault.recipient_name}
                  {vault.occasion && ` • ${vault.occasion}`}
                </p>
              </div>
              <div className="flex gap-2">
                <InviteDialog vaultId={vault.id} vaultTitle={vault.title} />
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {vault.description && (
              <p className="text-muted-foreground mt-4 max-w-2xl">
                {vault.description}
              </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{pages.length}</strong> {pages.length === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Pages Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl">Memory Pages</h2>
            <CreatePageDialog vaultId={vault.id} onCreatePage={createPage} />
          </div>

          {pagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 border border-border rounded-lg">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start adding memories to this vault. You can also invite friends and family to contribute.
              </p>
              <CreatePageDialog vaultId={vault.id} onCreatePage={createPage} />
            </div>
          ) : (
            <div className="space-y-4">
              {pages.map((page, index) => (
                <PageCard
                  key={page.id}
                  page={page}
                  pageNumber={index + 1}
                  onDelete={handleDeletePage}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VaultDetail;
