import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type Nationality = 
  | 'ukrainian' | 'russian' | 'polish' | 'lithuanian' | 'latvian' 
  | 'estonian' | 'romanian' | 'bulgarian' | 'moldovan' | 'georgian' 
  | 'armenian' | 'uzbek' | 'kazakh' | 'other';

interface UserPreferencesContextType {
  nationality: Nationality | null;
  setNationality: (nationality: Nationality) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  isPro: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [nationality, setNationalityState] = useState<Nationality | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedNationality = localStorage.getItem('userNationality');
    const savedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (savedNationality) {
      setNationalityState(savedNationality as Nationality);
    }
    if (savedOnboarding === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Check PRO status from Supabase subscriptions
    const checkProStatus = async () => {
      if (!user) {
        setIsPro(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        setIsPro(false);
      } else {
        setIsPro(true);
      }
    };

    checkProStatus();
  }, [user]);

  const setNationality = (nationality: Nationality) => {
    setNationalityState(nationality);
    localStorage.setItem('userNationality', nationality);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  return (
    <UserPreferencesContext.Provider value={{ 
      nationality, 
      setNationality, 
      hasCompletedOnboarding, 
      completeOnboarding,
      isPro 
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
