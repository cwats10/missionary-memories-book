import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVault } from '@/hooks/useVault';
import { usePages, Page } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';
import { CreatePageDialog } from '@/components/vault/CreatePageDialog';
import { SortablePageList } from '@/components/vault/SortablePageList';
import { EditPageDialog } from '@/components/vault/EditPageDialog';
import { InviteDialog } from '@/components/vault/InviteDialog';
import { BookPreview } from '@/components/vault/BookPreview';
import { CheckoutDialog } from '@/components/vault/CheckoutDialog';
import { DownloadPdfButton } from '@/components/vault/DownloadPdfButton';
import { TitlePageCard } from '@/components/vault/TitlePageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';

const VaultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { vault, loading: vaultLoading, refetch: refetchVault } = useVault(id);
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage, reorderPages, approvePage, rejectPage, submitPage } = usePages(id);
  
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  
  const isOwner = vault?.owner_id === user?.id;

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

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
  };

  const handleSavePage = async (pageId: string, updates: Partial<Page>) => {
    const result = await updatePage(pageId, updates);
    if (!result.error) {
      setEditingPage(null);
    }
    return result;
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
          <div className="mb-10">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-serif text-4xl">Mission Memory Vault</h1>
              <span className="text-xl text-muted-foreground">
                {vault.recipient_name}
              </span>
              {vault.mission_name && (
                <span className="text-muted-foreground">
                  {vault.mission_name}
                </span>
              )}
            </div>
            {vault.description && (
              <p className="text-muted-foreground mt-3 max-w-2xl">
                {vault.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 pb-10 border-b border-border">
            <InviteDialog vaultId={vault.id} vaultTitle="Mission Memory Vault" />
            <BookPreview 
              recipientName={vault.recipient_name}
              missionName={vault.mission_name}
              serviceStartDate={vault.service_start_date}
              serviceEndDate={vault.service_end_date}
              pages={pages} 
            />
            <DownloadPdfButton vaultId={vault.id} disabled={pages.length === 0} />
            <CheckoutDialog 
              vaultTitle="Mission Memory Vault" 
              pageCount={pages.length} 
            />
          </div>

          {/* Title Page Section */}
          <div className="mb-8">
            <h2 className="font-serif text-xl mb-4">Title Page</h2>
            <TitlePageCard vault={vault} isOwner={isOwner} onUpdate={refetchVault} />
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
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Drag pages to reorder them in your book
              </p>
              <SortablePageList
                pages={pages}
                onReorder={reorderPages}
                onDelete={handleDeletePage}
                onEdit={handleEditPage}
                onApprove={approvePage}
                onReject={rejectPage}
                onSubmit={submitPage}
                isOwner={isOwner}
              />
            </>
          )}
        </div>
      </main>

      {/* Edit Page Dialog */}
      <EditPageDialog
        page={editingPage}
        open={!!editingPage}
        onOpenChange={(open) => !open && setEditingPage(null)}
        onSave={handleSavePage}
      />
    </div>
  );
};

export default VaultDetail;
