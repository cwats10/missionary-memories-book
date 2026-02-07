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
import { ThankYouDialog } from '@/components/vault/ThankYouDialog';
import { ManagersList } from '@/components/vault/ManagersList';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, BookOpen, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImageBlobToJpeg } from '@/lib/imageCompression';
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
    refetch: refetchPages,
  } = usePages(id);

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageFilter, setPageFilter] = useState<PageFilter>('all');
  const [optimizingImages, setOptimizingImages] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

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

  const needsImageOptimization = useMemo(() => {
    return pages.some((p) => {
      const urls = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
      return urls.some((u) => !/\.jpe?g(\?|$)/i.test(u));
    });
  }, [pages]);

  if (authLoading || vaultLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="absolute inset-0 paper-texture pointer-events-none" />
        <LoadingSpinner message="Loading vault..." />
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

  const handleOptimizeImages = async () => {
    if (!user) return;

    setOptimizingImages(true);

    try {
      let optimizedCount = 0;

      for (const p of pages) {
        const urls = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
        if (urls.length === 0) continue;

        let changed = false;
        const newUrls: string[] = [];

        for (const url of urls) {
          // Already JPEG? keep.
          if (/\.jpe?g(\?|$)/i.test(url)) {
            newUrls.push(url);
            continue;
          }

          try {
            const res = await fetch(url);
            if (!res.ok) {
              newUrls.push(url);
              continue;
            }

            const blob = await res.blob();
            const jpgBlob = await compressImageBlobToJpeg(blob, { maxDimension: 1200, quality: 0.8 });

            const fileName = `${user.id}/optimized/${Date.now()}-${crypto.randomUUID()}.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('page-images')
              .upload(fileName, jpgBlob, { contentType: 'image/jpeg', upsert: true });

            if (uploadError) {
              console.error('Optimize upload error:', uploadError);
              newUrls.push(url);
              continue;
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from('page-images').getPublicUrl(fileName);

            newUrls.push(publicUrl);
            changed = true;
            optimizedCount += 1;
          } catch (e) {
            console.error('Optimize image failed:', e);
            newUrls.push(url);
          }
        }

        if (changed) {
          // Update without spamming per-page toasts
          const { error } = await supabase
            .from('pages')
            .update({
              image_urls: newUrls,
              image_url: newUrls[0] || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', p.id);

          if (error) {
            console.error('Failed updating page after optimize:', error);
          }
        }
      }

      await refetchPages();

      toast.success(
        optimizedCount > 0
          ? `Optimized ${optimizedCount} image${optimizedCount === 1 ? '' : 's'}. Try downloading the PDF again.`
          : 'No images needed optimization.'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to optimize images');
    } finally {
      setOptimizingImages(false);
    }
  };

  const handleSavePage = async (pageId: string, updates: Partial<Page>) => {
    const result = await updatePage(pageId, updates);
    if (!result.error) {
      setEditingPage(null);
    }
    return result;
  };

  const handleSubmitPage = async (pageId: string) => {
    const result = await submitPage(pageId);
    if (!result.error) {
      // Show thank you dialog for contributors after successful submission
      if (isContributor) {
        setShowThankYou(true);
      }
    }
    return result;
  };

  const filterButtons: { key: PageFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: visiblePages.length },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'draft', label: 'Drafts', count: draftCount },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      {/* Header - matches Dashboard styling */}
      <header className="border-b border-stone/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <a href="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
              {brandConfig.name}
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-stone/30 hover:border-gold/40"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
        {/* Gold accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="font-serif-text text-muted-foreground hover:text-gold transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <span className="font-serif-text text-foreground">
              {vault?.recipient_name || 'Vault'}
            </span>
          </nav>

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

          {/* Managers List - Owner only */}
          {isOwner && <ManagersList vaultId={vault.id} />}

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
                <CreatePageDialog vaultId={vault.id} vaultType={vault.vault_type} recipientName={vault.recipient_name} onCreatePage={createPage} isOwner={isOwner} />
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
                <CreatePageDialog vaultId={vault.id} vaultType={vault.vault_type} recipientName={vault.recipient_name} onCreatePage={createPage} isOwner={isOwner} />
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
                onSubmit={handleSubmitPage}
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

      {/* Thank You Dialog for Contributors */}
      <ThankYouDialog
        open={showThankYou}
        onOpenChange={setShowThankYou}
        recipientName={vault.recipient_name}
      />
    </div>
  );
};

export default VaultDetail;
