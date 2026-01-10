import { supabase } from '@/integrations/supabase/client';

export interface List {
  id: string;
  user_id: string;
  title: string;
  progress: number;
  is_archived: boolean;
  is_template: boolean;
  template_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  text: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const listsService = {
  async getLists(userId: string, includeArchived = false): Promise<List[]> {
    let query = supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as List[];
  },

  async getArchivedLists(userId: string): Promise<List[]> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as List[];
  },

  async getList(listId: string): Promise<List | null> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId)
      .maybeSingle();

    if (error) throw error;
    return data as List | null;
  },

  async createList(userId: string, title: string, templateKey?: string): Promise<List> {
    const { data, error } = await supabase
      .from('lists')
      .insert({
        user_id: userId,
        title,
        template_key: templateKey || null,
        is_template: false,
        progress: 0,
        is_archived: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as List;
  },

  async updateList(listId: string, updates: Partial<Pick<List, 'title' | 'is_archived' | 'progress'>>): Promise<List> {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return data as List;
  },

  async deleteList(listId: string): Promise<List> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return {} as List;
  },

  async getListItems(listId: string): Promise<ListItem[]> {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as ListItem[];
  },

  async addListItem(listId: string, text: string, sortOrder: number): Promise<ListItem> {
    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId,
        text,
        sort_order: sortOrder,
        is_done: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ListItem;
  },

  async updateListItem(itemId: string, updates: Partial<Pick<ListItem, 'text' | 'is_done'>>): Promise<ListItem> {
    const { data, error } = await supabase
      .from('list_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as ListItem;
  },

  async deleteListItem(itemId: string): Promise<ListItem> {
    const { data, error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as ListItem;
  },

  calculateProgress(items: ListItem[]): number {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.is_done).length;
    return Math.round((completed / items.length) * 100);
  },
};
