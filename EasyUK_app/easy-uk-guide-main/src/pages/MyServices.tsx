import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, CreditCard, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
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


interface Service {
  id: string;
  service_name: string;
  description: string;
  status: string;
  subscription_tier: string;
  trial_start: string;
  trial_end: string;
  stripe_subscription_id: string | null;
  photos: string[] | null;
  created_at: string;
  moderation_status: 'active' | 'under_review' | 'suspended' | null;
}

export default function MyServices(){
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  useEffect(() => {
    // Check if returning from successful subscription
    const subscriptionStatus = searchParams.get('subscription');
    const serviceId = searchParams.get('service');

    if (subscriptionStatus === 'success' && serviceId) {
      verifySubscription(serviceId);
    }
  }, [searchParams]);

  const fetchServices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const verifySubscription = async (serviceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-service-subscription', {
        body: { serviceId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Subscription activated successfully!');
        fetchServices(); // Refresh services
      } else {
        toast.error('Subscription verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast.error('Failed to verify subscription');
    }
  };

  const handleSubscribe = async (serviceId: string, tier: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-service-subscription', {
        body: { serviceId, tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to start subscription process');
    }
  };
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service.id);
    setDeleteDialogOpen(true);
  }

    const handleDeleteService = async () => {
      if (!serviceToDelete) return;
  
      try {
        console.log('====================================');
        console.log('🔵 Attempting to delete service');
        console.log('🔵 Service ID:', serviceToDelete);
        console.log('🔵 Current user ID:', user?.id);
        
        const { data: beforeDelete } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceToDelete)
          .single();
  
        console.log('📦 Service before delete:', beforeDelete);
  
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', serviceToDelete);
  
        if (error) {
          console.error('❌ Delete error:', error);
          toast.error(error.message || "Не вдалося видалити послугу");
          return;
        }
  
        const { data: afterDelete, count } = await supabase
          .from('services')
          .select('*', { count: 'exact' })
          .eq('id', serviceToDelete);
    
        console.log('📦 Service after delete:', afterDelete);
        console.log('📊 Count after delete:', count);
        console.log('====================================');
        
        if (count === 0) {
          console.log('✅ Service SUCCESSFULLY deleted from database!');
          toast.success("Послугу успішно видалено з бази даних");
        } else {
          console.log('⚠️ Service still exists in database!');
          toast.error("Послуга не видалена з бази даних");
        }
  
        setServices(prevServices => 
          prevServices.filter(s => s.id !== serviceToDelete)
        );
  
      } catch (error) {
        console.error('❌ Catch error:', error);
        toast.error("Виникла помилка при видаленні");
      } finally {
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    };

  const getStatusBadge = (service: Service) => {
    //Check moderation status First
    if (service.moderation_status === 'suspended') {
      return (
        <div className="flex item-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{t('myServices.suspended')}</span>
        </div>
      );
    }

    const now = new Date();
    const trialEnd = new Date(service.trial_end);
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    switch (service.status) {
      case 'trial':
        if (daysLeft <= 0) {
          return (
            <div className="flex items-center gap-2 text-destructive">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{t('myServices.trialExpired')}</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{daysLeft} {t('myServices.daysLeft')}</span>
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{t('myServices.active')}</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{t('myServices.cancelled')}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getPriceForTier = (tier: string) => {
    return tier === 'top' ? '£4.99' : '£1.99';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <><div className="min-h-screen bg-background pb-20">
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
          <h1 className="text-xl font-semibold">{t('myServices.title')}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('myServices.noServices')}</p>
            <Button onClick={() => navigate('/add-service')}>
              {t('myServices.addFirst')}
            </Button>
          </div>
        ) : (
          services.map((service) => {
            const now = new Date();
            const trialEnd = new Date(service.trial_end);
            const isTrialExpired = service.status === 'trial' && trialEnd < now;
            const isSuspended = service.moderation_status === 'suspended';

          return (
            <Card key={service.id} className={`p-4 space-y-3 ${isSuspended ? 'opacity-75 border-destructive' : ''}`}>
              <div className="flex gap-4">
                {/* Service thumbnail */}
                {service.photos && service.photos.length > 0 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border">
                    <img
                      src={service.photos[0]}
                      alt={service.service_name}
                      className="w-full h-full object-cover" />
                  </div>
                )}

            <div className="flex-1 flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-md">{service.service_name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {service.description}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/edit-service/${service.id}`)}
                  disabled={isSuspended}
                  title={isSuspended ? t('myServices.actionDisabledModeration') : undefined}
                  >
                    <Edit className="h5 w-5"/>
                </Button>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(service)}
                className="text-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {getStatusBadge(service)}
            <span className="text-sm text-muted-foreground capitalize">
              {service.subscription_tier} {t('myServices.plan')}
            </span>
          </div>

            {isSuspended && (
              <div className="pt-3 border-t">
                <p className="text-sm text-destructive">
                  {t('myServices.moderationMessage')}
                </p>
              </div>
            )}
            {!isSuspended && service.status === 'trial' && (
                <div className="pt-3 border-t space-y-2">
                  {isTrialExpired ? (
                    <p className="text-sm text-destructive">
                      {t('myServices.trialExpired')}. {t('myServices.subscribeNow').toLowerCase()}.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('myServices.trialEnds')} {new Date(service.trial_end).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    onClick={() => handleSubscribe(service.id, service.subscription_tier)}
                    className="w-full border-primary"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('myServices.subscribeNow')} - {getPriceForTier(service.subscription_tier)}/month
                  </Button>
                  <Button
                    className="w-full mt-2"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setServiceToDelete(service.id);
                      setDeleteDialogOpen(true);
                    } }
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              )
            }

            {
              !isSuspended && service.status === 'trial' && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={() => handleSubscribe(service.id, service.subscription_tier)}
                    className="w-full border-primary"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('myServices.subscribeNow')} - {getPriceForTier(service.subscription_tier)}/month
                  </Button>
                  <Button
                    className="w-full mt-2"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setServiceToDelete(service.id);
                      setDeleteDialogOpen(true);
                    } }
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              )
            }

            {
              !isSuspended && service.status === 'cancelled' && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={() => handleSubscribe(service.id, service.subscription_tier)}
                    variant="outline"
                    className="w-full border-primary"
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('myServices.subscribeNow')} - {getPriceForTier(service.subscription_tier)}/month
                  </Button>
                  <Button
                    className="w-full mt-2"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setServiceToDelete(service.id);
                      setDeleteDialogOpen(true);
                    } }
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              )}
      </Card>
      );
      })
      )}
    </div><AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myServices.deleteServiceTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myServices.deleteServiceMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setServiceToDelete(null);
            } }>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete') || 'Видалити'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BottomNav />
    </div>
   </>
  );
  }
function SplashScreen() {
  throw new Error('Function not implemented.');
}

