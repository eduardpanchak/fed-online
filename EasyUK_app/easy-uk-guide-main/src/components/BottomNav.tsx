import { Home, ListChecks, Bookmark, User, Info } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';

export const BottomNav = () => {
  const { t } = useLanguage();
  const getActiveTab = () => {
  const path = location.pathname;
  
  // Главная страница и все что связано с услугами
  if (path === '/' || path === '/services' || path.startsWith('/services')) {
    return '/';
  }
  
  // Списки
  if (path.startsWith('/lists')) {
    return 'lists';
  }
  
  // Сохраненное
  if (path.startsWith('/saved')) {
    return 'saved';
  }
  
  // Инфо - все информационные разделы
  if (path.startsWith('/documents') || 
      path.startsWith('/nhs') || 
      path.startsWith('/jobs') || 
      path.startsWith('/housing') || 
      path.startsWith('/benefits') || 
      path.startsWith('/education') ||
      path.startsWith('/about') ||
      path.startsWith('/faq')) {
    return 'info';
  }
  
  // Аккаунт
  if (path.startsWith('/account') || 
      path.startsWith('/my-profile') ||
      path.startsWith('/my-services') ||
      path.startsWith('/add-service') ||
      path.startsWith('/edit-service') ||
      path.startsWith('/business-registration')||
      path.startsWith('/statistics')) {
    return 'account';
  }
  
  return null; // По умолчанию
};

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
          to="/lists"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <ListChecks className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('nav.lists')}</span>
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
          to="/info"
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
