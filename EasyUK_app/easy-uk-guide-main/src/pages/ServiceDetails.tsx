import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Phone, Mail, Heart, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  phone: string | null;
  email: string | null;
  social_links: any;
  status: string;
}

interface Review {
  id: string;
  service_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toggleSaved, isSaved } = useApp();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchService(id);
      fetchReviews(id);
    }
  }, [id, user]);

  const fetchService = async (serviceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching service:', error);
        toast.error(t('serviceDetails.fetchError'));
        return;
      }

      if (!data) {
        toast.error(t('serviceDetails.notFound'));
        navigate('/services');
        return;
      }

      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error(t('serviceDetails.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }

      // Find user's review if logged in
      if (user) {
        const userReviewData = data?.find(review => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (rating: number, reviewText: string) => {
    if (!user || !id) {
      toast.error(t('reviews.signInToReview'));
      return;
    }

    try {
      if (editingReview && userReview) {
        // Update existing review
        const { error } = await supabase
          .from('service_reviews')
          .update({
            rating,
            review_text: reviewText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success(t('reviews.reviewUpdated'));
      } else {
        // Create new review
        const { error } = await supabase
          .from('service_reviews')
          .insert({
            service_id: id,
            user_id: user.id,
            rating,
            review_text: reviewText,
          });

        if (error) throw error;
        toast.success(t('reviews.reviewAdded'));
      }

      setShowReviewForm(false);
      setEditingReview(false);
      fetchReviews(id);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast.success(t('reviews.reviewDeleted'));
      setDeleteDialogOpen(false);
      if (id) fetchReviews(id);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = () => {
    setEditingReview(true);
    setShowReviewForm(true);
  };

  const handleVisitWebsite = () => {
    if (service?.social_links?.website) {
      window.open(service.social_links.website, '_blank');
    }
  };

  const handleCall = () => {
    if (service?.phone) {
      window.location.href = `tel:${service.phone}`;
    }
  };

  const handleEmail = () => {
    if (service?.email) {
      window.location.href = `mailto:${service.email}`;
    }
  };

  const handleSaveToggle = async () => {
    if (service) {
      await toggleSaved({ id: service.id, type: 'service', title: service.service_name });
      toast.success(
        isSaved(service.id) 
          ? t('serviceDetails.removedFromSaved') 
          : t('serviceDetails.addedToSaved')
      );
    }
  };

  const saved = service ? isSaved(service.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const websiteUrl = service.social_links?.website;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold line-clamp-1 flex-1">{service.service_name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className="shrink-0"
            aria-label={saved ? "Remove from saved" : "Add to saved"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                saved 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Main Photo */}
        <div className="w-full aspect-video bg-muted relative overflow-hidden">
          {service.photos && service.photos.length > 0 ? (
            <img 
              src={service.photos[0]} 
              alt={service.service_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-6xl">📷</span>
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="p-6 space-y-6">
          {/* Service Name */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {service.service_name}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">
                {service.category}
              </span>
              {service.pricing && (
                <span className="text-2xl font-bold text-primary">
                  £{service.pricing}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('serviceDetails.description')}
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t('serviceDetails.contactProvider')}
            </h3>

            {websiteUrl && (
              <Button
                onClick={handleVisitWebsite}
                className="w-full"
                size="lg"
                variant="default"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                {t('serviceDetails.visitWebsite')}
              </Button>
            )}

            {service.phone && (
              <Button
                onClick={handleCall}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('serviceDetails.callProvider')}
              </Button>
            )}

            {service.email && (
              <Button
                onClick={handleEmail}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('serviceDetails.emailProvider')}
              </Button>
            )}
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('reviews.title')}
                </h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="font-semibold text-foreground">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length} {t('reviews.basedOnReviews')})
                    </span>
                  </div>
                )}
              </div>

              {user && !userReview && !showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  variant="outline"
                  size="sm"
                >
                  {t('reviews.addReview')}
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm
                initialRating={editingReview ? userReview?.rating : 0}
                initialReviewText={editingReview ? userReview?.review_text || '' : ''}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(false);
                }}
                submitLabel={editingReview ? t('reviews.updateReview') : t('reviews.submitReview')}
              />
            )}

            {/* User's existing review */}
            {userReview && !showReviewForm && (
              <ReviewCard
                rating={userReview.rating}
                reviewText={userReview.review_text}
                createdAt={userReview.created_at}
                isOwnReview={true}
                onEdit={handleEditReview}
                onDelete={() => setDeleteDialogOpen(true)}
              />
            )}

            {/* Other reviews */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews
                  .filter(review => review.id !== userReview?.id)
                  .map((review) => (
                    <ReviewCard
                      key={review.id}
                      rating={review.rating}
                      reviewText={review.review_text}
                      createdAt={review.created_at}
                      isOwnReview={false}
                    />
                  ))}
              </div>
            ) : !userReview && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('reviews.noReviews')}</p>
                {user && (
                  <p className="text-sm mt-1">{t('reviews.beFirst')}</p>
                )}
              </div>
            )}

            {!user && !showReviewForm && (
              <div className="text-center py-4">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                >
                  {t('reviews.signInToReview')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reviews.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
