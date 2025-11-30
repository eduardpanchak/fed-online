import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  onToggle: (id: string) => Promise<void>;
  onClick?: () => void;
}

export const ChecklistItem = ({ id, title, description, completed, onToggle, onClick }: ChecklistItemProps) => {
  return (
    <div className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all mt-0.5",
          completed 
            ? "bg-success border-success" 
            : "border-border hover:border-primary"
        )}
      >
        {completed && <Check className="w-full h-full text-white p-0.5" />}
      </button>
      
      <button
        onClick={onClick}
        className="flex-1 text-left"
      >
        <h4 className={cn(
          "font-medium text-foreground",
          completed && "line-through text-muted-foreground"
        )}>
          {title}
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </button>
    </div>
  );
};
