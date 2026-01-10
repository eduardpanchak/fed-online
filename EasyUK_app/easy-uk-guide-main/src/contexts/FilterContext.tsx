import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface FilterContextType {
  filters: ServiceFilters;
  setFilters: (filters: ServiceFilters) => void;
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
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
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
