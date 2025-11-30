import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MousePointer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

interface ServiceStats {
  id: string;
  service_name: string;
  view_count: number;
  click_count: number;
  status: string;
}

export default function Statistics() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, view_count, click_count, status')
        .eq('user_id', user.id)
        .order('view_count', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getTotalViews = () => {
    return services.reduce((sum, service) => sum + (service.view_count || 0), 0);
  };

  const getTotalClicks = () => {
    return services.reduce((sum, service) => sum + (service.click_count || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('statistics.title')}</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.totalViews')}</p>
                <p className="text-2xl font-bold">{getTotalViews()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MousePointer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.totalClicks')}</p>
                <p className="text-2xl font-bold">{getTotalClicks()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t('statistics.performance')}</h2>
          
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('statistics.noServices')}</p>
              <Button onClick={() => navigate('/add-service')} className="mt-4">
                {t('myServices.addFirst')}
              </Button>
            </div>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.service_name}</h3>
                      <span className="text-xs text-muted-foreground capitalize">
                        {service.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('statistics.views')}</p>
                        <p className="text-lg font-semibold">{service.view_count || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('statistics.clicks')}</p>
                        <p className="text-lg font-semibold">{service.click_count || 0}</p>
                      </div>
                    </div>
                  </div>

                  {service.view_count > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t('statistics.clickRate')}</span>
                        <span className="font-medium">
                          {((service.click_count / service.view_count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
