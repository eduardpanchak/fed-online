import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { PaywallModal } from '@/components/PaywallModal';
import { useNavigate } from 'react-router-dom';
import { jobsData } from '@/data/jobsData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useLanguage } from '@/contexts/LanguageContext';

const FREE_ITEMS_COUNT = 3;

export default function Jobs() {
  const navigate = useNavigate();
  const { isPro } = useUserPreferences();
  const { t } = useLanguage();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleItemClick = (itemId: string, index: number) => {
    const isLocked = index >= FREE_ITEMS_COUNT && !isPro;
    if (isLocked) {
      setShowPaywall(true);
    } else {
      navigate(`/jobs/${itemId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('home.jobs')} showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {jobsData.map((item, index) => (
          <Card
            key={item.id}
            icon={item.icon}
            title={t(item.titleKey)}
            onClick={() => handleItemClick(item.id, index)}
            locked={index >= FREE_ITEMS_COUNT && !isPro}
          />
        ))}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      <BottomNav />
    </div>
  );
}
