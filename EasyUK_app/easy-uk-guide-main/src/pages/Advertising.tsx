import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { Megaphone, Plus, List } from 'lucide-react';

export default function Advertising() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/advertising' }} replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('ads.title')} showBack />

      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
          <Megaphone className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">{t('ads.promoteYourBusiness')}</h2>
            <p className="text-sm text-muted-foreground">{t('ads.promoteDescription')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Card
            title={t('ads.addAdvertisement')}
            description={t('ads.addAdvertisementDesc')}
            icon={Plus}
            onClick={() => navigate('/advertising/add')}
          />

          <Card
            title={t('ads.myAds')}
            description={t('ads.myAdsDesc')}
            icon={List}
            onClick={() => navigate('/advertising/my-ads')}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
