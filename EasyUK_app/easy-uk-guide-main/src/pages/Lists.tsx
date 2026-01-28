import { useState, useEffect, useCallback } from 'react';
import { data, useNavigate } from 'react-router-dom';
import { Archive, Plus, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ListCard } from '@/components/lists/ListCard';
import { TemplateCard } from '@/components/lists/TemplateCard';
import { CreateListDialog } from '@/components/lists/CreateListDialog';
import { EditListDialog } from '@/components/lists/EditListDialog';
import { DeleteConfirmDialog } from '@/components/lists/DeleteConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { listsService, List, ListItem } from '@/services/listsService';
import { listTemplates, ListTemplate } from '@/data/listTemplatesData';
import { supabase } from '@/integrations/supabase/client';

export async function createList(
  userId: string,
  title: string,
  templateKey?: string
) {
  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: userId,
      title,
      is_template: false,
      template_key: templateKey ?? null,
      is_archived: false
    })
    .select()
    .single();

  if (error) {
    console.error("createList error:", error);
    throw error;
  }

  return data; // ← ОБЯЗАТЕЛЬНО
}

export async function addListItem(
  listId: string,
  text: string,
  position: number
) {
  const { error } = await supabase
    .from("list_items")
    .insert({
      list_id: listId,
      text,
      position
    });

  if (error) {
    console.error("addListItem error:", error);
    throw error;
  }
}


export default function Lists() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lists, setLists] = useState<List[]>([]);
  const [listItemCounts, setListItemCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const fetchLists = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await listsService.getLists(user.id);
      setLists(data);

      // Fetch item counts for each list
      const counts: Record<string, { completed: number; total: number }> = {};
      await Promise.all(
        data.map(async (list) => {
          const items = await listsService.getListItems(list.id);
          counts[list.id] = {
            completed: items.filter((i) => i.is_done).length,
            total: items.length,
          };
        })
      );
      setListItemCounts(counts);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t('lists.myLists')} />
        <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <p className="text-center text-muted-foreground mb-6">
            {t('lists.signInRequired')}
          </p>
          <Button onClick={() => navigate('/auth')}>
            {t('lists.signInButton')}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }


 const handleCreateList = async (title: string) => {
  if (!user) return;

  try {
    await listsService.createList(user.id, title);
    toast({ title: t("lists.listCreated") });

    try {
      await fetchLists();
    } catch (e) {
      console.error("fetchLists failed after create:", e);
    }
  } catch (error) {
    console.error("Error creating list:", error);
    toast({ title: t("lists.errorCreating"), variant: "destructive" });
  }
};



 const handleAddTemplate = async (template: ListTemplate) => {
  if (!user) return;

  try {
    const title = t(template.titleKey);
    const list = await listsService.createList(user.id, title, template.key);

    if (!list || !list.id) {
      throw new Error("List created but no id returned from server");
    }
    try {
      const itemPromises = template.items.map((item, index) => 
        listsService.addListItem(list.id, t(item.textKey), index)
      );
      await Promise.all(itemPromises);
    } catch (itemError) {
      console.error("Failed to add some template items:", itemError);
    }

    toast({ title: t("lists.listCreated") });
    
    await fetchLists();

  } catch (error) {
    console.error("Error adding template:", error);
    toast({ 
      title: t("lists.errorCreating"), 
      description: error instanceof Error ? error.message : undefined,
      variant: "destructive" 
    });
  }
};





  const handleEditList = async (listId: string, title: string) => {
    try {
      await listsService.updateList(listId, { title });
      toast({ title: t('lists.listUpdated') });
      fetchLists();
    } catch (error) {
      console.error('Error updating list:', error);
      toast({ title: t('lists.errorUpdating'), variant: 'destructive' });
    }
  };

  const handleArchiveList = async (list: List) => {
    try {
      await listsService.updateList(list.id, { is_archived: true });
      toast({ title: t('lists.listArchived') });
      fetchLists();
    } catch (error) {
      console.error('Error archiving list:', error);
      toast({ title: t('lists.errorArchiving'), variant: 'destructive' });
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;
    try {
      await listsService.deleteList(selectedList.id);
      toast({ title: t('lists.listDeleted') });
      setDeleteDialogOpen(false);
      setSelectedList(null);
      fetchLists();
      navigate('/lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({ title: t('lists.errorDeleting'), variant: 'destructive' });
    }
  };

  const activeLists = lists.filter((l) => !l.is_archived);
  const hasNoLists = activeLists.length === 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('lists.myLists')} />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Top Actions */}
        <div className="flex items-center justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/lists/archived')}
            className="text-muted-foreground"
          >
            <Archive className="h-4 w-4 mr-2" />
            {t('lists.archived')}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* My Lists Section */}
            {hasNoLists ? (
              <p className="text-center text-muted-foreground py-8">
                {t('lists.noListsYet')}
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {activeLists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    completedCount={listItemCounts[list.id]?.completed || 0}
                    totalCount={listItemCounts[list.id]?.total || 0}
                    onEdit={(l) => {
                      setSelectedList(l);
                      setEditDialogOpen(true);
                    }}
                    onArchive={handleArchiveList}
                    onDelete={(l) => {
                      setSelectedList(l);
                      setDeleteDialogOpen(true);
                    }}
                    onClick={(l) => navigate(`/lists/${l.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Separator and Templates */}
            <Separator className="my-6" />

            <h2 className="font-semibold text-foreground mb-4">
              {t('lists.listsYouCanAdd')}
            </h2>

            <div className="space-y-3 mb-6">
              {listTemplates.map((template) => (
                <TemplateCard
                  key={template.key}
                  template={template}
                  onAdd={handleAddTemplate}
                />
              ))}
            </div>

            {/* Add Custom List Button */}
            <Button
              className="w-full"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('lists.addOwnList')}
            </Button>
          </>
        )}
      </div>

      <CreateListDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateList}
      />

      <EditListDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        list={selectedList}
        onSave={handleEditList}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteList}
      />

      <BottomNav />
    </div>
  );
}
