import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomNav } from '@/components/BottomNav';
import { CompletionModal } from '@/components/lists/CompletionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { listsService, List, ListItem } from '@/services/listsService';

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [listData, itemsData] = await Promise.all([
        listsService.getList(id),
        listsService.getListItems(id),
      ]);
      setList(listData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching list:', error);
      toast({ title: t('lists.errorLoading'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [id, t, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProgress = useCallback(async (updatedItems: ListItem[]) => {
    if (!list) return;
    const progress = listsService.calculateProgress(updatedItems);
    await listsService.updateList(list.id, { progress });
    setList((prev) => (prev ? { ...prev, progress } : null));

    // Check for completion
    if (progress === 100 && updatedItems.length > 0 && !hasShownCompletion) {
      setHasShownCompletion(true);
      setCompletionModalOpen(true);
    }
  }, [list, hasShownCompletion]);

  const handleToggleItem = async (item: ListItem) => {
    try {
      const newIsDone = !item.is_done;
      await listsService.updateListItem(item.id, { is_done: newIsDone });
      const updatedItems = items.map((i) =>
        i.id === item.id ? { ...i, is_done: newIsDone } : i
      );
      setItems(updatedItems);
      await updateProgress(updatedItems);
    } catch (error) {
      console.error('Error toggling item:', error);
      toast({ title: t('lists.errorUpdating'), variant: 'destructive' });
    }
  };

  const handleAddItem = async () => {
    if (!list || !newItemText.trim()) return;
    try {
      const newItem = await listsService.addListItem(list.id, newItemText.trim(), items.length);
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      setNewItemText('');
      await updateProgress(updatedItems);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({ title: t('lists.errorAdding'), variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await listsService.deleteListItem(itemId);
      const updatedItems = items.filter((i) => i.id !== itemId);
      setItems(updatedItems);
      await updateProgress(updatedItems);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ title: t('lists.errorDeleting'), variant: 'destructive' });
    }
  };

const handleShare = async () => {
    if (!list) return;
    
    const appName = t('app.title');
    const shareText = t('lists.shareMessage', { appName, listName: list.title });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.title,
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
    }
    
    setCompletionModalOpen(false);
    toast({ title: t('lists.shareSuccess') });
  };

  const handleArchive = async () => {
    if (!list) return;
    try {
      await listsService.updateList(list.id, { is_archived: true });
      toast({ title: t('lists.listArchived') });
      setCompletionModalOpen(false);
      navigate('/lists');
    } catch (error) {
      console.error('Error archiving list:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <Button variant="ghost" onClick={() => navigate('/lists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          {t('lists.notFound')}
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleClose = () => {
  setCompletionModalOpen(false);
  setHasShownCompletion(false);
  }

  const completedCount = items.filter((i) => i.is_done).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lists')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate">{list.title}</h1>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{items.length} {t('lists.itemsCompleted')}
              </p>
            </div>
            <span className="text-lg font-semibold text-primary">{list.progress}%</span>
          </div>
          <Progress value={list.progress} className="mt-3 h-2" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Items List */}
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
            >
              <Checkbox
                checked={item.is_done}
                onCheckedChange={() => handleToggleItem(item)}
              />
              <span
                className={`flex-1 ${
                  item.is_done ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="flex gap-2">
          <Input
            placeholder={t('lists.addItemPlaceholder')}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CompletionModal
        open={completionModalOpen}
        onClose={handleClose}
        listTitle={list.title}
        onShare={handleShare}
        onArchive={handleArchive}
      />

      <BottomNav />
    </div>
  );
}
