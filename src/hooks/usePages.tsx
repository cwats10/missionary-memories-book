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
  page_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePageInput {
  vault_id: string;
  title?: string;
  content?: string;
  image_url?: string;
}

export function usePages(vaultId: string | undefined) {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    if (!user || !vaultId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('vault_id', vaultId)
      .order('page_order', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } else {
      setPages(data || []);
    }
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
        image_url: input.image_url || null,
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

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    refetch: fetchPages,
  };
}
