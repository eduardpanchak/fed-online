import React from 'react';
import { Star, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  rating: number;
  reviewText: string | null;
  createdAt: string;
  isOwnReview: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReviewCard = ({
  rating,
  reviewText,
  createdAt,
  isOwnReview,
  onEdit,
  onDelete
}: ReviewCardProps) => {
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      {/* Rating Stars */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= rating 
                  ? "fill-amber-500 text-amber-500" 
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* Review Text */}
      {reviewText && (
        <p className="text-sm text-foreground leading-relaxed">{reviewText}</p>
      )}

      {/* Actions for own reviews */}
      {isOwnReview && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
