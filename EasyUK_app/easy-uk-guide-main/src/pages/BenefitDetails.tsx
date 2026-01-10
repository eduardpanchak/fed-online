import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { benefitsData } from '@/data/benefitsData';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BenefitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useApp();
  const { t } = useLanguage();
  
  const item = benefitsData.find(d => d.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.notFound')}</p>
      </div>
    );
  }

  const title = t(item.titleKey);
  const saved = isSaved(item.id);

  const handleSave = async () => {
    await toggleSaved({
      id: item.id,
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
          <span className="text-5xl">{item.icon}</span>
          <h1 className="text-2xl font-bold text-foreground flex-1">{title}</h1>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-4">
            <div className="space-y-3 prose prose-sm max-w-none">
              {item.contentKeys.map((key, i) => {
                const text = t(key);
                if (text.startsWith('**') && text.endsWith('**')) {
                  return <h3 key={i} className="font-semibold text-foreground mt-4 mb-2">{text.replace(/\*\*/g, '')}</h3>;
                } else if (text.startsWith('**') && text.includes(':**')) {
                  return <h4 key={i} className="font-semibold text-foreground mt-3 mb-1">{text.replace(/\*\*/g, '')}</h4>;
                } else if (text === '') {
                  return <div key={i} className="h-2" />;
                } else {
                  return <p key={i} className="text-sm text-foreground leading-relaxed">{text}</p>;
                }
              })}
            </div>
          </section>

          {item.eligibilityKeys && item.eligibilityKeys.length > 0 && (
            <section className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h2 className="font-semibold text-foreground">{t('benefits.eligibility')}</h2>
              </div>
              <ul className="space-y-2">
                {item.eligibilityKeys.map((key, i) => {
                  const text = t(key);
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5">{text.startsWith('✅') ? '✅' : text.startsWith('⚠️') ? '⚠️' : '•'}</span>
                      <span className="text-sm text-foreground">{text.replace(/^[✅⚠️]\s/, '')}</span>
                    </li>
                  );
                })}
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

