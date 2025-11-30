import { ChevronRight, LucideIcon, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  icon?: string | LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  to?: string;
  locked?: boolean;
}

export const Card = ({ icon, title, description, onClick, className, children, to, locked = false }: CardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full bg-card border border-border rounded-xl p-4 text-left",
        "hover:border-primary transition-all active:scale-95",
        "flex items-center gap-3 shadow-sm relative",
        locked && "opacity-60",
        className
      )}
    >
      {icon && (
        <div className="text-3xl flex-shrink-0">
          {typeof icon === 'string' ? icon : (() => {
            const IconComponent = icon;
            return <IconComponent className="h-6 w-6" />;
          })()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        )}
      </div>
      {locked ? (
        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      ) : (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      {children}
    </button>
  );
};
