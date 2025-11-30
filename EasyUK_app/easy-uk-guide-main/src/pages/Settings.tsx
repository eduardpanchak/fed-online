import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences, Nationality } from '@/contexts/UserPreferencesContext';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { nationality, setNationality } = useUserPreferences();

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'uk' as const, name: 'Українська', flag: '🇺🇦' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' }
  ];

  const nationalities = [
    { code: 'ukrainian' as const, name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'russian' as const, name: 'Russian', flag: '🇷🇺' },
    { code: 'polish' as const, name: 'Polish', flag: '🇵🇱' },
    { code: 'lithuanian' as const, name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'latvian' as const, name: 'Latvian', flag: '🇱🇻' },
    { code: 'estonian' as const, name: 'Estonian', flag: '🇪🇪' },
    { code: 'romanian' as const, name: 'Romanian', flag: '🇷🇴' },
    { code: 'bulgarian' as const, name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'moldovan' as const, name: 'Moldovan', flag: '🇲🇩' },
    { code: 'georgian' as const, name: 'Georgian', flag: '🇬🇪' },
    { code: 'armenian' as const, name: 'Armenian', flag: '🇦🇲' },
    { code: 'uzbek' as const, name: 'Uzbek', flag: '🇺🇿' },
    { code: 'kazakh' as const, name: 'Kazakh', flag: '🇰🇿' },
    { code: 'other' as const, name: 'Other', flag: '🌍' },
  ];

  const currentLanguage = languages.find(l => l.code === language);
  const currentNationality = nationalities.find(n => n.code === nationality);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('settings.title')} />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full">
              <Card
                icon="🌍"
                title="Change nationality"
                description={currentNationality ? `${currentNationality.flag} ${currentNationality.name}` : 'Not set'}
              />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change nationality</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
              {nationalities.map(nat => (
                <button
                  key={nat.code}
                  onClick={() => {
                    setNationality(nat.code);
                    toast.success(`Nationality: ${nat.name}`);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{nat.flag}</span>
                    <span className="font-medium text-foreground">{nat.name}</span>
                  </div>
                  {nationality === nat.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full">
              <Card
                icon="🌐"
                title={t('settings.language')}
                description={`${currentLanguage?.flag} ${currentLanguage?.name}`}
              />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('settings.language')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    toast.success(`${t('settings.language')}: ${lang.name}`);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-foreground">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <Card
          icon="ℹ️"
          title={t('settings.about')}
          description={t('settings.aboutDesc')}
          onClick={() => toast.info(t('messages.aboutInfo'))}
        />
        
        <Card
          icon="💬"
          title={t('settings.feedback')}
          description={t('settings.feedbackDesc')}
          onClick={() => toast.success(t('messages.feedbackInfo'))}
        />

        <Card
          icon="💼"
          title={t('settings.businessMode')}
          description={t('settings.businessModeDesc')}
          to="/business-registration"
        />
      </div>

      <BottomNav />
    </div>
  );
}
