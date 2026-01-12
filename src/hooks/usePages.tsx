import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Page {
  id: string;
  vault_id: string;
  contributor_id: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  image_urls: string[];
  page_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  contributor_name?: string | null;
}

export interface CreatePageInput {
  vault_id: string;
  title?: string;
  content?: string;
  image_url?: string;
  image_urls?: string[];
}

export function usePages(vaultId: string | undefined) {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    if (!user || !vaultId) return;
    
    setLoading(true);
    
    // Fetch pages first
    const { data: pagesData, error } = await supabase
      .from('pages')
      .select('*')
      .eq('vault_id', vaultId)
      .order('page_order', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
      setLoading(false);
      return;
    }

    // Get unique contributor IDs
    const contributorIds = [...new Set((pagesData || []).map(p => p.contributor_id))];
    
    // Fetch profiles for contributors
    let profilesMap: Record<string, string> = {};
    if (contributorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', contributorIds);
      
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.user_id] = profile.full_name || profile.email;
        });
      }
    }

    // Map pages with contributor names
    const pagesWithNames = (pagesData || []).map((page) => ({
      ...page,
      image_urls: page.image_urls || [],
      contributor_name: profilesMap[page.contributor_id] || null,
    }));
    
    setPages(pagesWithNames);
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, [user, vaultId]);

  const createPage = async (input: CreatePageInput) => {
    if (!user) return { error: new Error('Not authenticated') };

    const nextOrder = pages.length;

    const { data, error } = await supabase
      .from('pages')
      .insert({
        vault_id: input.vault_id,
        contributor_id: user.id,
        title: input.title || null,
        content: input.content || null,
        image_url: input.image_urls?.[0] || input.image_url || null,
        image_urls: input.image_urls || (input.image_url ? [input.image_url] : []),
        page_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
      return { error };
    }

    toast.success('Page created!');
    await fetchPages();
    return { data };
  };

  const updatePage = async (pageId: string, updates: Partial<Page>) => {
    const { error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', pageId);

    if (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page');
      return { error };
    }

    toast.success('Page updated');
    await fetchPages();
    return { error: null };
  };

  const deletePage = async (pageId: string) => {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
      return { error };
    }

    toast.success('Page deleted');
    await fetchPages();
    return { error: null };
  };

  const reorderPages = async (reorderedPages: Page[]) => {
    // Optimistically update local state
    setPages(reorderedPages);

    // Update each page's order in the database
    const updates = reorderedPages.map((page, index) => ({
      id: page.id,
      page_order: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('pages')
        .update({ page_order: update.page_order })
        .eq('id', update.id);

      if (error) {
        console.error('Error reordering pages:', error);
        toast.error('Failed to reorder pages');
        await fetchPages(); // Revert on error
        return { error };
      }
    }

    return { error: null };
  };

  const approvePage = async (pageId: string) => {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'approved' })
      .eq('id', pageId);

    if (error) {
      console.error('Error approving page:', error);
      toast.error('Failed to approve page');
      return { error };
    }

    toast.success('Page approved!');
    await fetchPages();
    return { error: null };
  };

  const rejectPage = async (pageId: string) => {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'rejected' })
      .eq('id', pageId);

    if (error) {
      console.error('Error rejecting page:', error);
      toast.error('Failed to reject page');
      return { error };
    }

    toast.success('Page rejected');
    await fetchPages();
    return { error: null };
  };

  const unapprove = async (pageId: string) => {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'draft' })
      .eq('id', pageId);

    if (error) {
      console.error('Error unapproving page:', error);
      toast.error('Failed to update page');
      return { error };
    }

    toast.success('Page moved to drafts');
    await fetchPages();
    return { error: null };
  };

  const submitPage = async (pageId: string) => {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'submitted' })
      .eq('id', pageId);

    if (error) {
      console.error('Error submitting page:', error);
      toast.error('Failed to submit page');
      return { error };
    }

    toast.success('Page submitted for review!');
    await fetchPages();
    return { error: null };
  };

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    approvePage,
    rejectPage,
    unapprove,
    submitPage,
    refetch: fetchPages,
  };
}
