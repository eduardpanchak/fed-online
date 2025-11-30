import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountTypeSelection() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'regular' | 'business' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, refreshProfile } = useAuth();
  
  const returnTo = (location.state as any)?.returnTo || '/';
  const showCheckout = (location.state as any)?.showCheckout || false;

  const handleContinue = async () => {
    if (!selectedType) {
      toast.error(t('accountType.pleaseSelect'));
      return;
    }

    if (!user) {
      toast.error('User not found. Please sign in again.');
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_business_user: selectedType === 'business' })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t('accountType.success'));

      if (showCheckout) {
        const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout');
        if (checkoutError) throw checkoutError;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      }
      
      navigate(returnTo);
    } catch (error: any) {
      console.error('Error updating account type:', error);
      toast.error(error.message || 'Failed to update account type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('accountType.title')}</h1>
          <p className="text-muted-foreground">{t('accountType.subtitle')}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setSelectedType('regular')}
            className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
              selectedType === 'regular'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedType === 'regular' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{t('accountType.regular')}</h3>
                <p className="text-sm text-muted-foreground">{t('accountType.regularDesc')}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedType('business')}
            className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
              selectedType === 'business'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedType === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{t('accountType.business')}</h3>
                <p className="text-sm text-muted-foreground">{t('accountType.businessDesc')}</p>
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          className="w-full"
          disabled={loading || !selectedType}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('accountType.continue')}
        </Button>
      </Card>
    </div>
  );
}
