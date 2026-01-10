import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { documentsData } from '@/data/documentsData';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useApp();
  const { t } = useLanguage();
  
  const doc = documentsData.find(d => d.id === id);

  if (!doc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.notFound')}</p>
      </div>
    );
  }

  const title = t(doc.titleKey);
  const saved = isSaved(doc.id);

  const handleSave = async () => {
    await toggleSaved({
      id: doc.id,
      type: 'document',
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
          <span className="text-5xl">{doc.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{t(doc.expectedTimeKey)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3">{t('documents.whatYouNeed')}</h2>
            <ul className="space-y-2">
              {doc.whatYouNeedKeys.map((key, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-sm text-foreground">{t(key)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3">{t('documents.steps')}</h2>
            <ol className="space-y-3">
              {doc.stepsKeys.map((key, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground pt-0.5">{t(key)}</span>
                </li>
              ))}
            </ol>
          </section>

          {doc.warningsKeys.length > 0 && (
            <section className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h2 className="font-semibold text-foreground">{t('documents.important')}</h2>
              </div>
              <ul className="space-y-2">
                {doc.warningsKeys.map((key, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">⚠️</span>
                    <span className="text-sm text-foreground">{t(key)}</span>
                  </li>
                ))}
              </ul>
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

