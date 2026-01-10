import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ListTemplate } from '@/data/listTemplatesData';

interface TemplateCardProps {
  template: ListTemplate;
  onAdd: (template: ListTemplate) => void;
}

export const TemplateCard = ({ template, onAdd }: TemplateCardProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onAdd(template)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{t(template.titleKey)}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t(template.descriptionKey)}</p>
        </div>
      </div>
    </div>
  );
};
