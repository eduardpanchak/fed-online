import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photo: string | null;
  subscriptionTier?: string;
  onClick?: () => void;
}

export const ServiceCard = ({
  id,
  name,
  description,
  category,
  pricing,
  photo,
  subscriptionTier,
  onClick
}: ServiceCardProps) => {
  const { toggleSaved, isSaved } = useApp();
  const saved = isSaved(id);
  const isPremium = subscriptionTier === 'top' || subscriptionTier === 'premium';
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchRating();
  }, [id]);

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('rating')
        .eq('service_id', id);

      if (!error && data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setReviewCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved({ id, type: 'service', title: name });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-card rounded-xl p-3 text-left",
        "hover:border-primary transition-all active:scale-95",
        "flex items-start gap-3 shadow-sm relative",
        isPremium 
          ? "border-2 border-amber-500 shadow-lg shadow-amber-500/20" 
          : "border border-border"
      )}
    >
      {/* Left side - Photo */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {photo ? (
          <img 
            src={photo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-3xl">📷</span>
          </div>
        )}
      </div>

      {/* Right side - Content */}
      <div className="flex-1 min-w-0 pr-8">
        <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {category}
          </span>
          {pricing && (
            <span className="text-sm font-semibold text-foreground">
              £{pricing}
            </span>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-medium text-foreground">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Heart button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
        aria-label={saved ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all",
            saved 
              ? "fill-red-500 text-red-500" 
              : "text-muted-foreground hover:text-foreground"
          )}
        />
      </button>
    </button>
  );
};
