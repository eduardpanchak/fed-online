import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { ListCard } from '@/components/lists/ListCard';
import { DeleteConfirmDialog } from '@/components/lists/DeleteConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { listsService, List } from '@/services/listsService';

export default function ArchivedLists() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lists, setLists] = useState<List[]>([]);
  const [listItemCounts, setListItemCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const fetchLists = useCallback(async () => {
    if (!user) return;
    try {
      const data = await listsService.getArchivedLists(user.id);
      setLists(data);

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
      console.error('Error fetching archived lists:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleRestoreList = async (list: List) => {
    try {
      await listsService.updateList(list.id, { is_archived: false });
      toast({ title: t('lists.listRestored') });
      fetchLists();
    } catch (error) {
      console.error('Error restoring list:', error);
      toast({ title: t('lists.errorRestoring'), variant: 'destructive' });
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
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({ title: t('lists.errorDeleting'), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lists')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground">{t('lists.archivedLists')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lists.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {t('lists.noArchivedLists')}
          </p>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                completedCount={listItemCounts[list.id]?.completed || 0}
                totalCount={listItemCounts[list.id]?.total || 0}
                onEdit={() => {}}
                onArchive={() => {}}
                onDelete={(l) => {
                  setSelectedList(l);
                  setDeleteDialogOpen(true);
                }}
                onRestore={handleRestoreList}
                onClick={(l) => navigate(`/lists/${l.id}`)}
                isArchived
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteList}
        isPermanent
      />

      <BottomNav />
    </div>
  );
}