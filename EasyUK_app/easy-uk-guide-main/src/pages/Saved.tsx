import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type TabType = 'information' | 'services';

export default function Saved() {
  const { savedItems } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('information');
  const { t } = useLanguage();
  

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'nhs': return '🏥';
      case 'checklist': return '✅';
      case 'service': return '💼';
      default: return '📌';
    }
  };

  // Separate information items from service items
  const informationItems = savedItems.filter(item => item.type !== 'service');
  const serviceItems = savedItems.filter(item => item.type === 'service');

  const displayedItems = activeTab === 'information' ? informationItems : serviceItems;

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
        </div>

        {/* Content Area */}
        {displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('saved.noItems')}
            </h2>
            <p className="text-sm text-muted-foreground">
                {activeTab === 'information' 
                  ? t('saved.noItemsDesc') 
                  : t('saved.saveServisesFromProviders')}
              </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map(item => (
              <Card
                key={item.id}
                icon={getIcon(item.type)}
                title={item.title}
                description={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
