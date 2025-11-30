import { Home, CheckSquare, Bookmark, User, Briefcase, Info } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';

export const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        <NavLink
          to="/"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.home')}</span>
        </NavLink>
        
        <NavLink
          to="/checklists"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <CheckSquare className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.checklists')}</span>
        </NavLink>
        
        <NavLink
          to="/saved"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Bookmark className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.saved')}</span>
        </NavLink>

        <NavLink
          to="/services"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Info className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.services')}</span>
        </NavLink>

        <NavLink
          to="/account"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.account')}</span>
        </NavLink>
      </div>
    </nav>
  );
};
