import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { List } from '@/services/listsService';

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: List | null;
  onSave: (listId: string, title: string) => void;
}

export const EditListDialog = ({ open, onOpenChange, list, onSave }: EditListDialogProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (list) {
      setTitle(list.title);
    }
  }, [list]);

  const handleSave = () => {
    if (list && title.trim()) {
      onSave(list.id, title.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('lists.editList')}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={t('lists.listNamePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
