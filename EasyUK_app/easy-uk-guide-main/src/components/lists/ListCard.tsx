import { MoreVertical, Archive, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { List } from '@/services/listsService';

interface ListCardProps {
  list: List;
  completedCount: number;
  totalCount: number;
  onEdit: (list: List) => void;
  onArchive: (list: List) => void;
  onDelete: (list: List) => void;
  onRestore?: (list: List) => void;
  onClick: (list: List) => void;
  isArchived?: boolean;
}

export const ListCard = ({
  list,
  completedCount,
  totalCount,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
  onClick,
  isArchived = false,
}: ListCardProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onClick(list)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{list.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount}/{totalCount} {t('lists.itemsCompleted')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">{list.progress}%</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {isArchived ? (
                <>
                  <DropdownMenuItem onClick={() => onRestore?.(list)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('lists.restore')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(list)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('lists.deleteForever')}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onEdit(list)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('lists.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onArchive(list)}>
                    <Archive className="h-4 w-4 mr-2" />
                    {t('lists.archive')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(list)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('lists.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Progress value={list.progress} className="mt-3 h-2" />
    </div>
  );
};
