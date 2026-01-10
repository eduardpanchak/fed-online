import { useState } from 'react';
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

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string) => void;
}

export const CreateListDialog = ({ open, onOpenChange, onCreate }: CreateListDialogProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('lists.createNewList')}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={t('lists.listNamePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            {t('lists.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
