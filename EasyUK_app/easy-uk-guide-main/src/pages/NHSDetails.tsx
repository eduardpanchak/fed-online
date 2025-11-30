import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { nhsData } from '@/data/nhsData';
import { useApp } from '@/contexts/AppContext';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NHSDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useApp();
  
  const item = nhsData.find(d => d.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Information not found</p>
      </div>
    );
  }

  const saved = isSaved(item.id);

  const handleSave = () => {
    toggleSaved({
      id: item.id,
      type: 'nhs',
      title: item.title
    });
    toast.success(saved ? 'Removed from saved' : 'Saved!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={item.title} />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">{item.icon}</span>
          <h1 className="text-2xl font-bold text-foreground flex-1">{item.title}</h1>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-4">
            <div className="space-y-3">
              {item.content.map((paragraph, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {item.steps && item.steps.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-3">Steps</h2>
              <ol className="space-y-3">
                {item.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground pt-0.5">{step}</span>
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
            {saved ? 'Saved' : 'Save for Later'}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
