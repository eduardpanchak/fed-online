import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ServiceCard } from '@/components/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Search, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateDistance } from '@/lib/geolocation';
import { useToast } from '@/hooks/use-toast';

interface Info {
  id: string;
  service_name: string;
  description: string | null;
  category: string;
  pricing: string | null;
  photos: string[] | null;
  languages: string[];
  subscription_tier: string;
  latitude: number | null;
  longitude: number | null;
}

const SAVED_FILTERS_KEY = 'savedFilters';

export default function Services() {
  const { language, t } = useLanguage();
  const { filters, setFilters } = useFilters();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Info[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  // Local state synced with context
  const [searchText, setSearchText] = useState(filters.searchText);
  const [selectedCategory, setSelectedCategory] = useState(filters.selectedCategory);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [showNearby, setShowNearby] = useState(filters.showNearby);

  useEffect(() => {
    fetchServices();
    getUserLocation();
    loadSavedFilters();
  }, []);

  // Sync local state with context on change
  useEffect(() => {
    setFilters({
      searchText,
      selectedCategory,
      sortBy,
      showNearby,
    });
  }, [searchText, selectedCategory, sortBy, showNearby, setFilters]);

  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        const savedFilters = JSON.parse(saved);
        setSearchText(savedFilters.searchText || '');
        setSelectedCategory(savedFilters.selectedCategory || 'all');
        setSortBy(savedFilters.sortBy || 'newest');
        setShowNearby(savedFilters.showNearby || false);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const handleSaveFilter = () => {
    try {
      const filterData = {
        searchText,
        selectedCategory,
        sortBy,
        showNearby,
      };
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filterData));
      toast({
        title: t('services.filterSaved'),
      });
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  const handleClearSavedFilter = () => {
    try {
      localStorage.removeItem(SAVED_FILTERS_KEY);
      setSearchText('');
      setSelectedCategory('all');
      setSortBy('newest');
      setShowNearby(false);
      toast({
        title: t('services.filterCleared'),
      });
    } catch (error) {
      console.error('Error clearing saved filter:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('id, service_name, description, category, pricing, photos, languages, subscription_tier, latitude, longitude')
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      // Sort: Premium/Top services first, then others
      const sortedData = (data || []).sort((a, b) => {
        const aIsPremium = a.subscription_tier === 'top' || a.subscription_tier === 'premium';
        const bIsPremium = b.subscription_tier === 'top' || b.subscription_tier === 'premium';
        if (aIsPremium && !bIsPremium) return -1;
        if (!aIsPremium && bIsPremium) return 1;
        return 0;
      });

      setServices(sortedData);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredServices = services
    .filter(service => {
      // Nearby filter
      if (showNearby && userLocation) {
        if (!service.latitude || !service.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          service.latitude,
          service.longitude
        );
        if (distance > 10) return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      
      // Text search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesName = service.service_name?.toLowerCase().includes(searchLower);
        const matchesDescription = service.description?.toLowerCase().includes(searchLower);
        return matchesName || matchesDescription;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'price') {
        const priceA = parseFloat(a.pricing?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.pricing?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      }
      // Default: Premium first, then newest
      const aIsPremium = a.subscription_tier === 'top' || a.subscription_tier === 'premium';
      const bIsPremium = b.subscription_tier === 'top' || b.subscription_tier === 'premium';
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('app.title')} />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Filters Section */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('services.searchPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex gap-2 items-center flex-wrap">
            {userLocation && (
              <Button
                variant={showNearby ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNearby(!showNearby)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {t('services.nearby')}
              </Button>
            )}
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder={t('services.category')} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">{t('services.allCategories')}</SelectItem>
                <SelectItem value="repair">{t('categories.repair')}</SelectItem>
                <SelectItem value="beauty">{t('categories.beauty')}</SelectItem>
                <SelectItem value="construction">{t('categories.construction')}</SelectItem>
                <SelectItem value="cleaning">{t('categories.cleaning')}</SelectItem>
                <SelectItem value="delivery">{t('categories.delivery')}</SelectItem>
                <SelectItem value="food">{t('categories.food')}</SelectItem>
                <SelectItem value="transport">{t('categories.transport')}</SelectItem>
                <SelectItem value="legal">{t('categories.legal')}</SelectItem>
                <SelectItem value="accounting">{t('categories.accounting')}</SelectItem>
                <SelectItem value="translation">{t('categories.translation')}</SelectItem>
                <SelectItem value="education">{t('categories.education')}</SelectItem>
                <SelectItem value="healthcare">{t('categories.healthcare')}</SelectItem>
                <SelectItem value="housing">{t('categories.housing')}</SelectItem>
                <SelectItem value="car_services">{t('categories.car_services')}</SelectItem>
                <SelectItem value="other">{t('categories.other')}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'newest' | 'price')}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="newest">{t('services.newest')}</SelectItem>
                <SelectItem value="price">{t('services.priceLowToHigh')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save/Clear Filter Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveFilter}
              className="flex-1 px-4 py-2 "
            >
              <Save className="h-4 w-4 mr-2" />
              {t('services.saveFilter')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSavedFilter}
              className="flex-1 px-4 py-2 "
            >
              <X className="h-4 w-4 mr-2" />
              {t('services.clearSavedFilter')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {showNearby ? t('services.noNearbyServices') : t('services.noServices')}
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.service_name}
              description={service.description}
              category={service.category}
              pricing={service.pricing}
              photo={service.photos?.[0] || null}
              subscriptionTier={service.subscription_tier}
              onClick={() => navigate(`/services/${service.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
