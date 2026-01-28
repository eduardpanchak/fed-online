import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { entitlementsService } from "@/services/entitlementsService";
import { toast } from "sonner";
import React, { useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal = ({ isOpen, onClose }: PaywallModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, refreshEntitlements } = useAuth();
  const [loading, setLoading] = useState(false);
  const isNative = entitlementsService.isNativeApp();

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth', { state: { returnTo: '/', showCheckout: true } });
      onClose();
      return;
    }

    if (!isNative) {
      toast.info(t('subscriptions.mobileOnly'));
      return;
    }

    setLoading(true);
    try {
      const result = await entitlementsService.purchaseEntitlement('premium');
      
      if (result.success) {
        await refreshEntitlements?.();
        toast.success(t('subscriptions.purchaseSuccess'));
        onClose();
      } else if (result.error === 'CANCELLED') {
        // User cancelled
      } else {
        toast.error(t('subscriptions.purchaseFailed'));
      }
    } catch (error) {
      console.error('Error purchasing:', error);
      toast.error(t('subscriptions.purchaseFailed'));
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
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isNative ? (
              <Crown className="mr-2 h-4 w-4" />
            ) : (
              <Smartphone className="mr-2 h-4 w-4" />
            )}
            {isNative ? t('upgradeToPro') : t('subscriptions.openInApp')}
          </Button>

          {!isNative && (
            <p className="text-xs text-muted-foreground text-center">
              {t('subscriptions.mobileOnlyDesc')}
            </p>
          )}

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

