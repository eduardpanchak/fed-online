import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { mainChecklist } from '@/data/checklistsData';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Check } from 'lucide-react';

export default function ChecklistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checklistProgress, toggleChecklistItem } = useApp();
  
  const item = mainChecklist.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    );
  }

  const completed = !!checklistProgress[item.id];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Checklist Item" />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{item.title}</h1>
            <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
              {item.category}
            </span>
          </div>

          <section className="bg-card border border-border rounded-xl p-4">
            <p className="text-foreground leading-relaxed">{item.description}</p>
          </section>

          <Button
            onClick={async () => await toggleChecklistItem(item.id)}
            variant={completed ? "secondary" : "default"}
            className="w-full"
          >
            {completed && <Check className="w-4 h-4 mr-2" />}
            {completed ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
