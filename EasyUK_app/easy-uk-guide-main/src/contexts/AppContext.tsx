import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SavedItem {
  id: string;
  type: 'document' | 'nhs' | 'checklist' | 'service';
  title: string;
}

interface ChecklistProgress {
  [key: string]: boolean;
}

interface AppContextType {
  savedItems: SavedItem[];
  toggleSaved: (item: SavedItem) => Promise<void>;
  isSaved: (id: string) => boolean;
  checklistProgress: ChecklistProgress;
  toggleChecklistItem: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({});

  // Fetch saved items for current user
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved items:', error);
        return;
      }

      const items = data.map(item => ({
        id: item.item_id,
        type: item.item_type as 'document' | 'nhs' | 'checklist' | 'service',
        title: item.title
      }));
      setSavedItems(items);
    };

    fetchSavedItems();
  }, [user]);

  // Fetch checklist progress for current user
  useEffect(() => {
    const fetchChecklistProgress = async () => {
      if (!user) {
        setChecklistProgress({});
        return;
      }

      const { data, error } = await supabase
        .from('checklist_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching checklist progress:', error);
        return;
      }

      const progress: ChecklistProgress = {};
      data.forEach(item => {
        progress[item.checklist_id] = item.completed;
      });
      setChecklistProgress(progress);
    };

    fetchChecklistProgress();
  }, [user]);

  const toggleSaved = async (item: SavedItem) => {
    if (!user) return;

    const exists = savedItems.some(i => i.id === item.id);

    if (exists) {
      // Remove from database
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', item.id);

      if (error) {
        console.error('Error removing saved item:', error);
        return;
      }

      setSavedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      // Add to database
      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          title: item.title
        });

      if (error) {
        console.error('Error adding saved item:', error);
        return;
      }

      setSavedItems(prev => [...prev, item]);
    }
  };

  const isSaved = (id: string) => {
    return savedItems.some(item => item.id === id);
  };

  const toggleChecklistItem = async (id: string) => {
    if (!user) return;

    const currentState = checklistProgress[id] || false;
    const newState = !currentState;

    // Upsert to database
    const { error } = await supabase
      .from('checklist_progress')
      .upsert({
        user_id: user.id,
        checklist_id: id,
        completed: newState
      }, {
        onConflict: 'user_id,checklist_id'
      });

    if (error) {
      console.error('Error updating checklist progress:', error);
      return;
    }

    setChecklistProgress(prev => ({
      ...prev,
      [id]: newState
    }));
  };

  return (
    <AppContext.Provider value={{ savedItems, toggleSaved, isSaved, checklistProgress, toggleChecklistItem }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
