import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChecklistItem } from '@/components/ChecklistItem';
import { useApp } from '@/contexts/AppContext';
import { mainChecklist } from '@/data/checklistsData';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Checklists() {
  const { checklistProgress, toggleChecklistItem } = useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const completed = mainChecklist.filter(item => checklistProgress[item.id]).length;
  const total = mainChecklist.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('nav.checklists')} showSearch />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">What to Do After Arriving</h2>
            <span className="text-sm text-muted-foreground">{completed}/{total}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {mainChecklist.map(item => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              completed={!!checklistProgress[item.id]}
              onToggle={async (id) => await toggleChecklistItem(id)}
              onClick={() => navigate(`/checklists/${item.id}`)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
