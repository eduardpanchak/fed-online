import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import React, { useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal = ({ isOpen, onClose }: PaywallModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth', { state: { returnTo: '/', showCheckout: true } });
      onClose();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{t('unlockSection')}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t('proDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">£9.99</div>
            <div className="text-sm text-muted-foreground">{t('perYear')}</div>
          </div>

          <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('upgradeToPro')}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={onClose}
          >
            {t('maybeLater')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
