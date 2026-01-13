import { useState, useMemo } from 'react';
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
import { InviteManagerDialog } from '@/components/vault/InviteManagerDialog';
import { BookPreview } from '@/components/vault/BookPreview';
import { CheckoutDialog } from '@/components/vault/CheckoutDialog';
import { DownloadPdfButton } from '@/components/vault/DownloadPdfButton';
import { TitlePageCard } from '@/components/vault/TitlePageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PageFilter = 'all' | 'approved' | 'draft';

const VaultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { vault, loading: vaultLoading, userRole, refetch: refetchVault, updateVault } = useVault(id);
  const {
    pages,
    loading: pagesLoading,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    approvePage,
    rejectPage,
    unapprove,
    submitPage,
  } = usePages(id);

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageFilter, setPageFilter] = useState<PageFilter>('all');

  const isOwner = userRole === 'owner';
  const isManager = userRole === 'coowner';
  const isContributor = userRole === 'contributor';
  const canManage = isOwner || isManager; // Can see all pages and manage content

  // For contributors, only show their own pages. Owners and managers see all.
  const visiblePages = useMemo(() => {
    if (canManage) return pages;
    return pages.filter(p => p.contributor_id === user?.id);
  }, [pages, user, canManage]);

  // Count pages created by current user for contributor limit check
  const userPageCount = useMemo(() => {
    if (!user) return 0;
    return pages.filter(p => p.contributor_id === user.id).length;
  }, [pages, user]);

  const contributorPageLimit = vault?.contributor_page_limit || 1;
  const canCreateMorePages = isOwner || isManager || userPageCount < contributorPageLimit;

  const filteredPages = useMemo(() => {
    const basePagesForFilter = visiblePages;
    switch (pageFilter) {
      case 'approved':
        return basePagesForFilter.filter((p) => p.status === 'approved');
      case 'draft':
        return basePagesForFilter.filter((p) => p.status === 'draft' || p.status === 'submitted');
      default:
        return basePagesForFilter;
    }
  }, [visiblePages, pageFilter]);

  const approvedCount = useMemo(() => visiblePages.filter((p) => p.status === 'approved').length, [visiblePages]);
  const draftCount = useMemo(
    () => visiblePages.filter((p) => p.status === 'draft' || p.status === 'submitted').length,
    [visiblePages]
  );

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
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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

  const filterButtons: { key: PageFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: visiblePages.length },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'draft', label: 'Drafts', count: draftCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif text-xl tracking-tight">
            {brandConfig.name}
          </a>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Vaults
          </Button>

          {/* Vault Header */}
          <div className="mb-10">
            {canManage ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h1 className="font-serif text-4xl">Mission Memory Vault</h1>
                  <span className="text-xl text-muted-foreground">{vault.recipient_name}</span>
                  {vault.mission_name && <span className="text-muted-foreground">{vault.mission_name}</span>}
                </div>
                {vault.description && (
                  <p className="text-muted-foreground mt-3 max-w-2xl">{vault.description}</p>
                )}
                {isManager && (
                  <p className="text-sm text-primary mt-2">You are a manager of this vault</p>
                )}
              </>
            ) : (
              <>
                <h1 className="font-serif text-4xl mb-2">Contribute Your Memory</h1>
                <p className="text-muted-foreground max-w-2xl">
                  Add your special memories for {vault.recipient_name}. 
                  You can create up to {contributorPageLimit} {contributorPageLimit === 1 ? 'page' : 'pages'}.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons - Owner and Manager (Manager cannot download or reorder) */}
          {canManage && (
            <div className="flex flex-wrap justify-center gap-3 mb-10 pb-10 border-b border-border">
              <InviteDialog vaultId={vault.id} vaultTitle="Mission Memory Vault" />
              {isOwner && <InviteManagerDialog vaultId={vault.id} vaultTitle="Mission Memory Vault" />}
              <BookPreview
                recipientName={vault.recipient_name}
                missionName={vault.mission_name}
                serviceStartDate={vault.service_start_date}
                serviceEndDate={vault.service_end_date}
                pages={pages}
                vaultType={vault.vault_type}
              />
              {isOwner && (
                <DownloadPdfButton
                  vaultId={vault.id}
                  disabled={pages.length === 0 || approvedCount === 0}
                  disabledReason={
                    pages.length === 0
                      ? 'Add at least one page to enable PDF download'
                      : approvedCount === 0
                        ? 'Approve at least one page to enable PDF download'
                        : undefined
                  }
                  purchased={vault.status === 'purchased'}
                />
              )}
              {isOwner && (
                <CheckoutDialog 
                  vaultTitle="Mission Memory Vault" 
                  pageCount={pages.length} 
                  onOrderComplete={async () => {
                    const result = await updateVault({ status: 'purchased' });
                    if (!result.error) {
                      await refetchVault();
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Vault Settings - Owner only */}
          {isOwner && (
            <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Vault Settings</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-muted-foreground">Pages per contributor:</label>
                <Select
                  value={String(vault.contributor_page_limit)}
                  onValueChange={(value) => updateVault({ contributor_page_limit: parseInt(value) })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Title Page Section - Owner and Manager */}
          {canManage && (
            <div className="mb-8">
              <h2 className="font-serif text-xl mb-4">Title Page</h2>
              <TitlePageCard vault={vault} isOwner={isOwner} onUpdate={refetchVault} />
            </div>
          )}

          {/* Pages Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl">{canManage ? 'Memory Pages' : 'Your Pages'}</h2>
            <div className="flex items-center gap-4">
              {/* Status Filter Toggle - Owner and Manager */}
              {canManage && (
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                  {filterButtons.map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setPageFilter(btn.key)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
                        pageFilter === btn.key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {btn.label}
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          pageFilter === btn.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {btn.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {canCreateMorePages ? (
                <CreatePageDialog vaultId={vault.id} vaultType={vault.vault_type} recipientName={vault.recipient_name} bookSize={vault.book_size} onCreatePage={createPage} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  You've created {userPageCount}/{contributorPageLimit} pages
                </div>
              )}
            </div>
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
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl mb-2">
                {canManage 
                  ? (pageFilter === 'all' ? 'No pages yet' : `No ${pageFilter} pages`)
                  : 'No pages yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {canManage
                  ? (pageFilter === 'all'
                    ? 'Start adding memories to this vault. You can also invite friends and family to contribute.'
                    : `There are no ${pageFilter} pages to display.`)
                  : `Add your special memory for ${vault.recipient_name}. Click the button to get started!`}
              </p>
              {(canManage ? pageFilter === 'all' : true) && canCreateMorePages && (
                <CreatePageDialog vaultId={vault.id} vaultType={vault.vault_type} recipientName={vault.recipient_name} bookSize={vault.book_size} onCreatePage={createPage} />
              )}
              {(canManage ? pageFilter === 'all' : true) && !canCreateMorePages && (
                <p className="text-sm text-muted-foreground">
                  You've reached your limit of {contributorPageLimit} {contributorPageLimit === 1 ? 'page' : 'pages'}.
                </p>
              )}
            </div>
          ) : (
            <>
              {isOwner && (
                <p className="text-sm text-muted-foreground mb-4">Drag pages to reorder them in your book</p>
              )}
              <SortablePageList
                pages={filteredPages}
                onReorder={isOwner ? reorderPages : undefined}
                onDelete={handleDeletePage}
                onEdit={handleEditPage}
                onApprove={approvePage}
                onReject={rejectPage}
                onUnapprove={unapprove}
                onSubmit={submitPage}
                isOwner={canManage}
              />
            </>
          )}
        </div>
      </main>

      {/* Edit Page Dialog */}
      <EditPageDialog
        page={editingPage}
        bookSize={vault.book_size}
        open={!!editingPage}
        onOpenChange={(open) => !open && setEditingPage(null)}
        onSave={handleSavePage}
      />
    </div>
  );
};

export default VaultDetail;
