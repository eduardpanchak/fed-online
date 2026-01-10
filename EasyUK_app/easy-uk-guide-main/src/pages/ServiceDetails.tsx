import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Heart,
  Star,
  Globe,
  Flag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { LanguageBadge } from '@/components/LanguageMultiSelect';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  languages: string[];
  user_id: string; // важно для isOwner и report
}

interface Review {
  id: string;
  service_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  reviewer_name?: string | null;
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

  const [viewTracked, setViewTracked] = useState(false);

  // REPORT / FLAG
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [checkingReport, setCheckingReport] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const isOwner = user && service?.user_id === user.id;

  useEffect(() => {
    if (id) {
      fetchService(id);
      fetchReviews(id);
    }
    // при смене id сбрасываем view tracking и состояния репорта
    setViewTracked(false);
    setHasReported(false);
    setReportDialogOpen(false);
    setReportReason('');
  }, [id, user]);

  // Проверка: уже жаловался ли пользователь на этот сервис
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!user || !id) {
        setHasExistingReport(false);
        return;
      }

      setCheckingReport(true);
      try {
        const { data, error } = await supabase
          .from('service_reports')
          .select('id')
          .eq('service_id', id)
          .eq('reporter_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking existing report:', error);
          setHasExistingReport(false);
        } else {
          setHasExistingReport(!!data);
        }
      } catch (e) {
        console.error('Error checking existing report:', e);
        setHasExistingReport(false);
      } finally {
        setCheckingReport(false);
      }
    };

    checkExistingReport();
  }, [user, id]);

  // Track view once
  useEffect(() => {
    if (id && service && !viewTracked) {
      trackView(id);
      setViewTracked(true);
    }
  }, [id, service, viewTracked]);

  const trackView = async (serviceId: string) => {
    try {
      const { data: currentService } = await supabase
        .from('services')
        .select('view_count')
        .eq('id', serviceId)
        .single();

      if (currentService) {
        await supabase
          .from('services')
          .update({ view_count: (currentService.view_count || 0) + 1 })
          .eq('id', serviceId);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackClick = async (serviceId: string) => {
    try {
      const { data: currentService } = await supabase
        .from('services')
        .select('click_count')
        .eq('id', serviceId)
        .single();

      if (currentService) {
        await supabase
          .from('services')
          .update({ click_count: (currentService.click_count || 0) + 1 })
          .eq('id', serviceId);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

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

      setService(data as Service);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error(t('serviceDetails.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * ВАЖНО: чтобы отзывы не пропадали.
   * 1) Пробуем select с join на profiles для имени.
   * 2) Если join не работает (ошибка/нет доступа/нет связи) — fallback на обычный select('*').
   */
  const fetchReviews = async (serviceId: string) => {
    try {
      // попытка с join
      const joined = await supabase
        .from('service_reviews')
        .select(
          `
          *,
          profiles:user_id (name)
        `
        )
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (!joined.error) {
        const reviewsWithNames: Review[] = (joined.data || []).map((r: any) => ({
          ...r,
          reviewer_name: r.profiles?.name ?? null,
        }));

        applyReviewsState(reviewsWithNames);
        return;
      }

      console.warn('Reviews join failed, falling back:', joined.error);

      // fallback без join
      const plain = await supabase
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (plain.error) {
        console.error('Error fetching reviews:', plain.error);
        return;
      }

      applyReviewsState((plain.data || []) as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const applyReviewsState = (list: Review[]) => {
    setReviews(list);

    if (list.length > 0) {
      const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
      setAverageRating(Math.round(avg * 10) / 10);
    } else {
      setAverageRating(0);
    }

    if (user) {
      const ur = list.find((r) => r.user_id === user.id) || null;
      setUserReview(ur);
    } else {
      setUserReview(null);
    }
  };

  const handleSubmitReview = async (rating: number, reviewText: string) => {
    if (!user || !id) {
      toast.error(t('reviews.signInToReview'));
      return;
    }

    try {
      if (editingReview && userReview) {
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
        // ПРАВИЛЬНО: проверка ДО insert
        if (userReview) {
          toast.error(t('reviews.alreadyReviewed'));
          setShowReviewForm(false);
          return;
        }

        const { error } = await supabase.from('service_reviews').insert({
          service_id: id,
          user_id: user.id,
          rating,
          review_text: reviewText,
        });

        if (error) {
          // duplicate key
          if ((error as any).code === '23505') {
            toast.error(t('reviews.alreadyReviewed'));
            fetchReviews(id);
            setShowReviewForm(false);
            return;
          }
          throw error;
        }

        toast.success(t('reviews.reviewAdded'));
      }

      setShowReviewForm(false);
      setEditingReview(false);
      fetchReviews(id);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('reviews.submitError'));
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
      setUserReview(null);
      if (id) fetchReviews(id);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('reviews.deleteError'));
    }
  };

  const handleEditReview = () => {
    setEditingReview(true);
    setShowReviewForm(true);
  };

  const handleVisitWebsite = () => {
    if (service?.social_links?.website) {
      trackClick(service.id);
      window.open(service.social_links.website, '_blank');
    }
  };

  const handleCall = () => {
    if (service?.phone) {
      trackClick(service.id);
      window.location.href = `tel:${service.phone}`;
    }
  };

  const handleEmail = () => {
    if (service?.email) {
      trackClick(service.id);
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

  const handleReportService = async () => {
    if (!user || !service || !reportReason) {
      toast.error(t('report.selectReason'));
      return;
    }

    setSubmittingReport(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('report.signInRequired'));
        return;
      }

      const response = await supabase.functions.invoke('submit-service-report', {
        body: { serviceId: service.id, reason: reportReason },
      });

      if (response.error) {
        const errorMessage = response.error.message || t('report.submitError');
        if (errorMessage.includes('already reported')) {
          toast.error(t('report.alreadyReported'));
        } else {
          toast.error(errorMessage);
        }
        return;
      }

      toast.success(t('report.submitted'));
      setHasReported(true);
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(t('report.submitError'));
    } finally {
      setSubmittingReport(false);
    }
  };

  const saved = service ? isSaved(service.id) : false;
  const websiteUrl = service?.social_links?.website;

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

  if (!service) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-xl font-semibold line-clamp-1 flex-1">{service.service_name}</h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            className="shrink-0"
            aria-label={saved ? 'Remove from saved' : 'Add to saved'}
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-all',
                saved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Main Photo */}
        <div className="w-full aspect-video bg-muted relative overflow-hidden">
          {service.photos && service.photos.length > 0 ? (
            <img src={service.photos[0]} alt={service.service_name} className="w-full h-full object-cover" />
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
            <h2 className="text-3xl font-bold text-foreground mb-2">{service.service_name}</h2>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">
                {service.category}
              </span>

              {service.pricing && (
                <span className="text-2xl font-bold text-primary">£{service.pricing}</span>
              )}
            </div>

            {/* Languages */}
            {service.languages && service.languages.length > 0 && (
              <div className="flex mt-3">
                <label className="text-sm font-medium text-muted-foreground flex items-start gap-1.5 mb-2">
                  <Globe className="h-4 w-4" />
                  {t('services.languageFilter')}
                </label>
                <div className="flex items-center gap-1.5">
                  {service.languages.map((lang) => (
                    <LanguageBadge key={lang} code={lang} />
                  ))}
                </div>
              </div>
            )}
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
              <Button onClick={handleVisitWebsite} className="w-full" size="lg" variant="default">
                <ExternalLink className="h-5 w-5 mr-2" />
                {t('serviceDetails.visitWebsite')}
              </Button>
            )}

            {service.phone && (
              <Button onClick={handleCall} className="w-full" size="lg" variant="outline">
                <Phone className="h-5 w-5 mr-2" />
                {t('serviceDetails.callProvider')}
              </Button>
            )}

            {service.email && (
              <Button onClick={handleEmail} className="w-full" size="lg" variant="outline">
                <Mail className="h-5 w-5 mr-2" />
                {t('serviceDetails.emailProvider')}
              </Button>
            )}

            {/* REPORT BUTTON */}
            {user && !isOwner && (
              hasExistingReport || hasReported ? (
                <div className="w-full text-center py-2 px-4 rounded-md bg-muted/50 text-sm text-muted-foreground">
                  <Flag className="h-4 w-4 inline mr-2" />
                  {t('report.alreadyReportedMessage')}
                </div>
              ) : (
                <Button
                  onClick={() => setReportDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-destructive"
                  disabled={checkingReport}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {t('report.reportService')}
                </Button>
              )
            )}
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('reviews.title')}</h3>

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
                <Button onClick={() => setShowReviewForm(true)} variant="outline" size="sm">
                  {t('reviews.addReview')}
                </Button>
              )}
            </div>

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

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews
                  .filter((r) => r.id !== userReview?.id)
                  .map((r) => (
                    <ReviewCard
                      key={r.id}
                      rating={r.rating}
                      reviewText={r.review_text}
                      createdAt={r.created_at}
                      isOwnReview={false}
                    />
                  ))}
              </div>
            ) : (
              !userReview && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('reviews.noReviews')}</p>
                  {user && <p className="text-sm mt-1">{t('reviews.beFirst')}</p>}
                </div>
              )
            )}

            {!user && !showReviewForm && (
              <div className="text-center py-4">
                <Button onClick={() => navigate('/auth')} variant="outline">
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
            <AlertDialogDescription>{t('reviews.deleteCannotUndo')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Service Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('report.reportService')}</AlertDialogTitle>
            <AlertDialogDescription>{t('report.reportDescription')}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('report.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">{t('report.reasons.spam')}</SelectItem>
                <SelectItem value="inappropriate">{t('report.reasons.inappropriate')}</SelectItem>
                <SelectItem value="fake">{t('report.reasons.fake')}</SelectItem>
                <SelectItem value="scam">{t('report.reasons.scam')}</SelectItem>
                <SelectItem value="other">{t('report.reasons.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingReport}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportService}
              disabled={!reportReason || submittingReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submittingReport ? t('common.loading') : t('report.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}

