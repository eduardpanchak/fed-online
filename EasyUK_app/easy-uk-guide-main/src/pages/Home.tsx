import React from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.services')} showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Card
          icon="📄"
          title={t('home.documents')}
          description={t('home.documentsDesc')}
          onClick={() => navigate('/documents')}
        />
        
        <Card
          icon="🏥"
          title={t('home.nhs')}
          description={t('home.nhsDesc')}
          onClick={() => navigate('/nhs')}
        />
        
        <Card
          icon="✅"
          title={t('home.checklist')}
          description={t('home.checklistDesc')}
          onClick={() => navigate('/checklists')}
        />

        <Card
          icon="💼"
          title={t('home.jobs')}
          description={t('home.jobsDesc')}
          onClick={() => navigate('/jobs')}
        />

        <Card
          icon="🏠"
          title={t('home.housing')}
          description={t('home.housingDesc')}
          onClick={() => navigate('/housing')}
        />

        <Card
          icon="💷"
          title={t('home.benefits')}
          description={t('home.benefitsDesc')}
          onClick={() => navigate('/benefits')}
        />

        <Card
          icon="🎓"
          title={t('home.education')}
          description={t('home.educationDesc')}
          onClick={() => navigate('/education')}
        />
      </div>

      <BottomNav />
    </div>
  );
}
