import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { PaywallModal } from '@/components/PaywallModal';
import { useNavigate } from 'react-router-dom';
import { housingData } from '@/data/housingData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const FREE_ITEMS_COUNT = 3;

export default function Housing() {
  const navigate = useNavigate();
  const { isPro } = useUserPreferences();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleItemClick = (itemId: string, index: number) => {
    const isLocked = index >= FREE_ITEMS_COUNT && !isPro;
    if (isLocked) {
      setShowPaywall(true);
    } else {
      navigate(`/housing/${itemId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Housing" showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {housingData.map((item, index) => (
          <Card
            key={item.id}
            icon={item.icon}
            title={item.title}
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
