import { useState, useEffect, act } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { ServiceCard } from '@/components/ServiceCard';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
// import { set } from 'date-fns';
// import { get } from 'http';

type TabType = 'information' | 'services';

interface ServiceCardProps {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  subscription_tier: string;
}

export default function Saved() {
  const { savedItems } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const { t } = useLanguage();
  const [savedServices, setSavedServices] = useState<ServiceCardProps[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'nhs': return '🏥';
      case 'checklist': return '✅';
      default: return '📌';
    }
  };

  // Separate information items from service items
  const informationItems = savedItems.filter(item => item.type !== 'service');
  const serviceItemIds = savedItems.filter(item => item.type === 'service').map(item => item.id);

  useEffect(() => {
    const fetchSavedServices = async () => {
      if (activeTab !== 'services' || serviceItemIds.length === 0) {setSavedServices([]);
        return;
      }

      setLoadingServices(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, service_name, description, category, pricing, photos, subscription_tier')
          .in('id', serviceItemIds);

        if (error) {
          console.error('Error fetching saved services:', error);
        }
        
        setSavedServices(data || []);
      } catch (error) {
        console.error('Error fetching saved services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchSavedServices();
  }, [activeTab, serviceItemIds.join(',')]);
  
  const displayedItems = activeTab === 'information' ? informationItems : [];

  const handleItemClick = (item: typeof savedItems[0]) => {
    if (item.type === 'document') {
      navigate(`/documents/${item.id}`);
    } else if (item.type === 'nhs') {
      navigate(`/nhs/${item.id}`);
    } else if (item.type === 'checklist') {
      navigate(`/checklists/${item.id}`);
    } else if (item.type === 'service') {
      navigate(`/service/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('saved.title')} showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all",
              activeTab === 'services'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:border-primary"
            )}
          >
            {t('common.services')}
          </button>
          <button
            onClick={() => setActiveTab('information')}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all",
              activeTab === 'information'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:border-primary"
            )}
          >
            {t('saved.information')}
          </button>
          
        </div>

        {/* Content Area */}
        {activeTab === 'information' ? (
          displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-16 h-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t('saved.noItems')}</h2>
              <p className="text-sm text-muted-foreground">{t('saved.saveServisesFromProviders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedItems.map(item => (
                <Card
                  key={item.id}
                  icon={getIcon(item.type)}
                  title={item.title}
                  description={item.type.charAt(0).toUpperCase()+ item.type.slice(1)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          )
        ) : (
          loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : savedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-16 h-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t('saved.noItems')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('saved.saveServisesFromProviders')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedServices.map(service => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.service_name}
                  description={service.description}
                  category={service.category}
                  pricing={service.pricing}
                  photo={service.photos?.[0] || null}
                  subscriptionTier={service.subscription_tier}
                  onClick={() => navigate(`/services/${service.id}`)}
                />
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
