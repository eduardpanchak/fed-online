import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, CheckCircle, Trash2, Ban, AlertTriangle, Flag } from 'lucide-react';

interface ReportedService {
  id: string;
  service_name: string;
  category: string;
  user_id: string;
  reports_count: number;
  moderation_status: 'active' | 'under_review' | 'suspended';
  created_at: string;
  reports: {
    id: string;
    reason: string;
    created_at: string;
  }[];
}

const ModerationQueue = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [services, setServices] = useState<ReportedService[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'delete' | 'suspend' | 'ban_owner';
    serviceId?: string;
    ownerId?: string;
    serviceName?: string;
  }>({ open: false, action: 'approve' });
  
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    checkAccessAndLoadData();
  }, [user]);

  const checkAccessAndLoadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has moderator or admin role
      const { data: isModerator } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator'
      });

      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!isModerator && !isAdmin) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(true);
      await loadReportedServices();
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadReportedServices = async () => {
    try {
      // Get services with reports > 0
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, service_name, category, user_id, reports_count, moderation_status, created_at')
        .gt('reports_count', 0)
        .order('reports_count', { ascending: false });

      if (servicesError) throw servicesError;

      if (!servicesData || servicesData.length === 0) {
        setServices([]);
        return;
      }

      // Get reports for these services
      const serviceIds = servicesData.map(s => s.id);
      const { data: reportsData, error: reportsError } = await supabase
        .from('service_reports')
        .select('id, service_id, reason, created_at')
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Combine data
      const combinedServices: ReportedService[] = servicesData.map(service => ({
        ...service,
        moderation_status: service.moderation_status as 'active' | 'under_review' | 'suspended',
        reports: (reportsData || []).filter(r => r.service_id === service.id)
      }));

      setServices(combinedServices);
    } catch (error) {
      console.error('Error loading reported services:', error);
      toast.error(t('moderation.loadError'));
    }
  };

  const handleAction = async () => {
    const { action, serviceId, ownerId } = confirmDialog;
    
    setActionLoading(serviceId || ownerId || 'action');
    setConfirmDialog({ ...confirmDialog, open: false });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error(t('common.authRequired'));
        return;
      }

      const response = await supabase.functions.invoke('moderator-action', {
        body: {
          action,
          serviceId,
          ownerId,
          banReason: action === 'ban_owner' ? banReason : undefined
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Action failed');
      }

      toast.success(t(`moderation.${action}Success`));
      await loadReportedServices();
      setBanReason('');
    } catch (error: any) {
      console.error('Moderator action error:', error);
      toast.error(error.message || t('moderation.actionError'));
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmDialog = (
    action: 'approve' | 'delete' | 'suspend' | 'ban_owner',
    serviceId?: string,
    ownerId?: string,
    serviceName?: string
  ) => {
    setConfirmDialog({
      open: true,
      action,
      serviceId,
      ownerId,
      serviceName
    });
  };

  const getStatusBadge = (status: string, reportsCount: number) => {
    if (status === 'suspended') {
      return <Badge variant="destructive">{t('moderation.suspended')}</Badge>;
    }
    if (reportsCount >= 8) {
      return <Badge variant="destructive">{t('moderation.autoSuspended')}</Badge>;
    }
    if (reportsCount >= 4) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">{t('moderation.flagged')}</Badge>;
    }
    return <Badge variant="secondary">{t('moderation.active')}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t('moderation.title')} showBack />
        <main className="container max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t('moderation.title')} showBack />
        <main className="container max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('common.loginRequired')}</p>
              <Button className="mt-4" onClick={() => navigate('/auth')}>
                {t('common.signIn')}
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t('moderation.title')} showBack />
        <main className="container max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('moderation.noAccess')}</p>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('moderation.title')} showBack />
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('moderation.queue')}</h1>
          <Badge variant="secondary" className="ml-auto">
            {services.length} {t('moderation.servicesCount')}
          </Badge>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">{t('moderation.noReports')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className={service.moderation_status === 'suspended' ? 'border-destructive' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {service.reports_count} {t('moderation.reports')}
                      </Badge>
                      {getStatusBadge(service.moderation_status, service.reports_count)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Report reasons */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">{t('moderation.reportReasons')}:</p>
                    <div className="space-y-1">
                      {service.reports.slice(0, 5).map((report) => (
                        <div key={report.id} className="text-sm bg-muted p-2 rounded flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{report.reason}</span>
                        </div>
                      ))}
                      {service.reports.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{service.reports.length - 5} {t('moderation.moreReports')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => openConfirmDialog('approve', service.id, undefined, service.service_name)}
                      disabled={actionLoading === service.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('moderation.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                      onClick={() => openConfirmDialog('suspend', service.id, undefined, service.service_name)}
                      disabled={actionLoading === service.id || service.moderation_status === 'suspended'}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {t('moderation.suspend')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => openConfirmDialog('delete', service.id, undefined, service.service_name)}
                      disabled={actionLoading === service.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('moderation.delete')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openConfirmDialog('ban_owner', undefined, service.user_id, service.service_name)}
                      disabled={actionLoading === service.user_id}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      {t('moderation.banOwner')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(`moderation.confirm${confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1).replace('_', '')}Title`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'ban_owner' ? (
                <div className="space-y-4">
                  <p>{t('moderation.confirmBanOwnerDescription')}</p>
                  <div>
                    <Label htmlFor="banReason">{t('moderation.banReason')}</Label>
                    <Input
                      id="banReason"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder={t('moderation.banReasonPlaceholder')}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <p>
                  {t(`moderation.confirm${confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}Description`, {
                    name: confirmDialog.serviceName
                  })}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {t(`moderation.${confirmDialog.action}`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModerationQueue;
