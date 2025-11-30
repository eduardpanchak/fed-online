import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  reviewText: z.string().trim().max(1000, "Review must be less than 1000 characters").optional(),
});

interface ReviewFormProps {
  initialRating?: number;
  initialReviewText?: string;
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export const ReviewForm = ({
  initialRating = 0,
  initialReviewText = '',
  onSubmit,
  onCancel,
  submitLabel
}: ReviewFormProps) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialReviewText);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; reviewText?: string }>({});

  const handleSubmit = async () => {
    setErrors({});
    
    try {
      // Validate input
      const validatedData = reviewSchema.parse({ rating, reviewText });
      
      setIsSubmitting(true);
      await onSubmit(validatedData.rating, validatedData.reviewText || '');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { rating?: string; reviewText?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'rating') {
            fieldErrors.rating = err.message;
          } else if (err.path[0] === 'reviewText') {
            fieldErrors.reviewText = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Rating Selection */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {t('reviews.yourRating')}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {t('reviews.yourReview')} ({t('reviews.optional')})
        </label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={t('reviews.reviewPlaceholder')}
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.reviewText && (
            <p className="text-xs text-destructive">{errors.reviewText}</p>
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {reviewText.length}/1000
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="flex-1"
        >
          {isSubmitting ? t('common.loading') : submitLabel}
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </div>
  );
};
