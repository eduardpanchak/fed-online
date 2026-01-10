import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { nhsData } from '@/data/nhsData';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NHSDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useApp();
  const { t } = useLanguage();
  
  const item = nhsData.find(d => d.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.notFound')}</p>
      </div>
    );
  }

  const title = t(item.titleKey);
  const saved = isSaved(item.id);

  const handleSave = () => {
    toggleSaved({
      id: item.id,
      type: 'nhs',
      title: title
    });
    toast.success(saved ? t('common.removedFromSaved') : t('common.saved'));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={title} />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t('common.back')}</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">{item.icon}</span>
          <h1 className="text-2xl font-bold text-foreground flex-1">{title}</h1>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-4">
            <div className="space-y-3">
              {item.contentKeys.map((key, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">
                  {t(key)}
                </p>
              ))}
            </div>
          </section>

          {item.stepsKeys && item.stepsKeys.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-3">{t('documents.steps')}</h2>
              <ol className="space-y-3">
                {item.stepsKeys.map((key, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground pt-0.5">{t(key)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Button
            onClick={handleSave}
            variant={saved ? "secondary" : "default"}
            className="w-full"
          >
            <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} />
            {saved ? t('common.saved') : t('common.saveForLater')}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

