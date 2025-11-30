import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { User, Briefcase, Info, MessageSquare, HelpCircle, LogOut, Crown, Loader2, Languages, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Account() {
  const navigate = useNavigate();
  const { profile, user, subscription, checkSubscription, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [confirmBusinessDialogOpen, setConfirmBusinessDialogOpen] = useState(false);
  const [successBusinessDialogOpen, setSuccessBusinessDialogOpen] = useState(false);
  const [isBusinessUser, setIsBusinessUser] = useState(profile?.is_business_user || false);

  useEffect(() => {
    // Sync local state with profile
    setIsBusinessUser(profile?.is_business_user || false);
  }, [profile?.is_business_user]);

  useEffect(() => {
    // Check for success/cancel params
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
      checkSubscription();
      // Clean up URL
      window.history.replaceState({}, '', '/account');
    } else if (params.get('canceled') === 'true') {
      toast.info('Checkout canceled');
      // Clean up URL
      window.history.replaceState({}, '', '/account');
    }
  }, [checkSubscription]);

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLanguageChange = (lang: 'en' | 'uk' | 'ru' | 'pl' | 'lt') => {
    setLanguage(lang);
    setLanguageDialogOpen(false);
    toast.success(t('messages.savedItem'));
  };

  const handleEnableBusinessAccount = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_business_user: true })
        .eq('id', user!.id);

      if (error) throw error;

      // Update local state immediately
      setIsBusinessUser(true);
      
      // Refresh profile data
      await checkSubscription();
      
      // Close confirmation and show success
      setConfirmBusinessDialogOpen(false);
      setSuccessBusinessDialogOpen(true);
    } catch (error) {
      console.error('Error enabling business account:', error);
      toast.error('Failed to enable business account');
    }
  };

  const languageOptions = [
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
    { code: 'uk' as const, label: 'Українська', flag: '🇺🇦' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'pl' as const, label: 'Polski', flag: '🇵🇱' },
    { code: 'lt' as const, label: 'Lietuvių', flag: '🇱🇹' },
  ];

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/account' }} replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('account.title')} />

      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-card rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{profile?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">{t('account.subscription')}</h3>
          
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${subscription?.subscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <span className="font-medium block">{t('account.subscriptionStatus')}</span>
                  <span className={`text-sm ${subscription?.subscribed ? 'text-primary' : 'text-muted-foreground'}`}>
                    {subscription?.subscribed ? t('account.pro') : t('account.free')}
                  </span>
                </div>
              </div>
            </div>
            
            {subscription?.subscribed ? (
              <div className="space-y-3">
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    {t('account.renewsOn')} {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('account.manageSubscription')}
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('account.upgradeToPro')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">{t('account.profile')}</h3>
          
          <Card
            title={t('account.myProfile')}
            icon={User}
            onClick={() => navigate('/my-profile')}
          />

          <Card
            title={t('account.changeLanguage')}
            icon={Languages}
            onClick={() => setLanguageDialogOpen(true)}
          />
        </div>

        {!isBusinessUser && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-4">{t('account.upgrade')}</h3>
            
            <Card
              title={t('account.enableBusiness')}
              description={t('account.enableBusinessDesc')}
              icon={Briefcase}
              onClick={() => setConfirmBusinessDialogOpen(true)}
            />
          </div>
        )}

        {isBusinessUser && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-4">{t('account.business')}</h3>
            
            <Card
              title={t('account.myServices')}
              description={t('account.myServicesDesc')}
              icon={Briefcase}
              onClick={() => navigate('/my-services')}
            />
            
            <Card
              title={t('account.addServiceTitle')}
              description={t('account.addServiceDesc')}
              icon={Briefcase}
              onClick={() => navigate('/add-service')}
            />
            
            <Card
              title={t('account.statisticsTitle')}
              description={t('account.statisticsDesc')}
              icon={BarChart}
              onClick={() => navigate('/statistics')}
            />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">{t('account.support')}</h3>
          
          <Card
            title={t('account.aboutEasyUK')}
            icon={Info}
            onClick={() => navigate('/about')}
          />

          <Card
            title={t('account.feedback')}
            icon={MessageSquare}
            onClick={() => navigate('/feedback')}
          />

          <Card
            title={t('account.faq')}
            icon={HelpCircle}
            onClick={() => navigate('/faq')}
          />
        </div>

        <div className="pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('account.signOut')}
          </Button>
        </div>
      </div>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('account.selectLanguage')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => handleLanguageChange(option.code)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                  language === option.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{option.flag}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBusinessDialogOpen} onOpenChange={setConfirmBusinessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('account.businessConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            {t('account.businessConfirmBody')}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmBusinessDialogOpen(false)}
            >
              {t('account.businessConfirmCancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleEnableBusinessAccount}
            >
              {t('account.businessConfirmYes')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successBusinessDialogOpen} onOpenChange={setSuccessBusinessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('account.businessSuccessTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            {t('account.businessSuccessBody')}
          </p>
          <Button
            className="w-full"
            onClick={() => setSuccessBusinessDialogOpen(false)}
          >
            {t('account.businessSuccessContinue')}
          </Button>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
