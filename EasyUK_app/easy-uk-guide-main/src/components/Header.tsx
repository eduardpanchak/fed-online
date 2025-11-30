import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  showBack?: boolean;
}

export const Header = ({ title, showSearch = false, showBack = false }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {showSearch && (
        <button 
          onClick={() => navigate('/search')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </header>
  );
};
