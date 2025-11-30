import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { dbService } from '@/services/dbService';
import { storageService } from '@/services/storageService';
import { subscriptionService } from '@/services/subscriptionService';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  is_business_user?: boolean;
}

interface Subscription {
  status: 'free' | 'pro';
  subscription_end: string | null;
  subscribed: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: any }>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await dbService.getProfile(userId);

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await subscriptionService.checkSubscription();
      
      if (error) throw error;
      
      if (data) {
        setSubscription({
          status: data.status || 'free',
          subscription_end: data.subscription_end || null,
          subscribed: data.subscribed || false,
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ status: 'free', subscription_end: null, subscribed: false });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const subscription = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile and subscription fetching to avoid blocking auth state update
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkSubscription();
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    authService.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        checkSubscription();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await authService.signUp({ email, password, name });
    
    if (!error) {
      toast.success('Account created successfully!');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn({ email, password });
    
    if (!error) {
      toast.success('Welcome back!');
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await authService.signInWithGoogle();
    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await authService.signInWithApple();
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setProfile(null);
    setSubscription(null);
    toast.success('Signed out successfully');
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    
    if (!error) {
      toast.success('Password reset email sent!');
    }
    
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await dbService.updateProfile(user.id, updates);

    if (!error) {
      await fetchProfile(user.id);
      toast.success('Profile updated successfully!');
    }

    return { error };
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { url: null, error: new Error('Not authenticated') };

    const { url, error } = await storageService.uploadAvatar(user.id, file);

    if (error) {
      return { url: null, error };
    }

    return { url, error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
