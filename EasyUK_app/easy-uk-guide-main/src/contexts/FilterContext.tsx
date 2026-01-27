import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

const SESSION_SEED_KEY = 'servicesOrderSeed';

const generateNewSeed = (): number => {
  const newSeed = Math.floor(Math.random() * 1000000);
  sessionStorage.setItem(SESSION_SEED_KEY, newSeed.toString());
  return newSeed;
};

const getOrCreateSeed = (): number => {
  const existingSeed = sessionStorage.getItem(SESSION_SEED_KEY);
  if (existingSeed !== null) {
    return parseInt(existingSeed, 10);
  }
  return generateNewSeed();
};

interface ServiceFilters {
  searchText: string;
  selectedCategory: string;
  sortBy: 'newest' | 'price' | 'distance';
  showNearby: boolean;
  selectLangugages: string[];
  searchPostcode: string;
  searchRadius: number;
  userLat: number | null;
  userLng: number | null;
  selectedCountry: string;
  selectedBorough: string;
}

interface ScrollState {
  scrollPosition: number;
  hasRestoredState: boolean;
}

interface CachedService {
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
  postcode: string | null;
  city: string | null;
  country: string | null;
  borough: string | null;
}

interface FilterContextType {
  filters: ServiceFilters;
  setFilters: (filters: ServiceFilters) => void;
  orderSeed: number;
  regenerateSeed: () => void;
  scrollState: ScrollState;
  saveScrollPosition: (position: number) => void;
  markStateRestored: () => void;
  resetScrollState: () => void;
  cachedServices: CachedService[];
  setCachedServices: (services: CachedService[]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<ServiceFilters>({
    searchText: '',
    selectedCategory: 'all',
    sortBy: 'newest',
    showNearby: false,
    selectLangugages: [],
    searchPostcode: '',
    searchRadius: 10,
    userLat: null,
    userLng: null,
    selectedCountry: 'all',
    selectedBorough: 'all',
  });

  const [orderSeed, setOrderSeed] = useState<number>(() => getOrCreateSeed());

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollPosition: 0,
    hasRestoredState: false,
  });

  const [cachedServices, setCachedServices] = useState<CachedService[]>([]);

  const regenerateSeed = useCallback(() => {
    const newSeed = generateNewSeed();
    setOrderSeed(newSeed);
    // Clear cached services when seed changes
    setCachedServices([]);
  }, []);

  const saveScrollPosition = useCallback((position: number) => {
    setScrollState(prev => ({
      ...prev,
      scrollPosition: position,
      hasRestoredState: true, // Mark that we have state to restore
    }));
  }, []);

  const markStateRestored = useCallback(() => {
    setScrollState(prev => ({
      ...prev,
      hasRestoredState: false, // Clear the flag after restoration
    }));
  }, []);

  const resetScrollState = useCallback(() => {
    setScrollState({
      scrollPosition: 0,
      hasRestoredState: false,
    });
  }, []);

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setFilters, 
      orderSeed, 
      regenerateSeed,
      scrollState,
      saveScrollPosition,
      markStateRestored,
      resetScrollState,
      cachedServices,
      setCachedServices,
    }}>
  
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
