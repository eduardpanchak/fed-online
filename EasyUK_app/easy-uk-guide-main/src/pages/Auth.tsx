import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, signInWithApple, user } = useAuth();
  
  const returnTo = (location.state as any)?.returnTo || '/';
  const showCheckout = (location.state as any)?.showCheckout || false;
  const accountType = (location.state as any)?.accountType as 'regular' | 'business' | undefined;
  const isSignUpFromSelection = (location.state as any)?.isSignUp || false;

  const [isSignUp, setIsSignUp] = useState(isSignUpFromSelection);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OAuth redirect
  useEffect(() => {
    if (user) {
      // Check if this is a new user who hasn't selected account type yet
      const checkAccountType = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_business_user')
            .eq('id', user.id)
            .single();

          // If is_business_user is null/undefined, redirect to account type selection (OAuth users)
          if (profile && profile.is_business_user === null) {
            navigate('/account-type-selection', { 
              state: { returnTo, showCheckout } 
            });
            return;
          }
        } catch (error) {
          console.error('Error checking account type:', error);
        }

        // If account type is set, proceed with normal flow
        const pendingCheckout = localStorage.getItem('pendingCheckout');
        const pendingReturn = localStorage.getItem('pendingReturnTo');
        
        if (pendingCheckout === 'true') {
          localStorage.removeItem('pendingCheckout');
          localStorage.removeItem('pendingReturnTo');
          handleCheckout();
        } else if (pendingReturn) {
          localStorage.removeItem('pendingReturnTo');
          navigate(pendingReturn);
        } else if (showCheckout) {
          handleCheckout();
        } else {
          navigate(returnTo);
        }
      };

      checkAccountType();
    }
  }, [user]);

  const handleCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        navigate(returnTo);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
      navigate(returnTo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!name) {
        toast.error('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;

        // Get the current user after signup
        const { data: { session } } = await supabase.auth.getSession();
        const newUser = session?.user;

        // All new users start as regular users
        if (newUser) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_business_user: false })
            .eq('id', newUser.id);

          if (updateError) {
            console.error('Error setting account type:', updateError);
          }
        }

        toast.success('Account created successfully!');
        
        if (showCheckout) {
          await handleCheckout();
        } else {
          navigate(returnTo);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (showCheckout) {
          await handleCheckout();
        } else {
          navigate(returnTo);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Store pending actions for OAuth redirect
    if (showCheckout) {
      localStorage.setItem('pendingCheckout', 'true');
      localStorage.setItem('pendingReturnTo', returnTo);
    } else if (returnTo !== '/') {
      localStorage.setItem('pendingReturnTo', returnTo);
    }
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    // Store pending actions for OAuth redirect
    if (showCheckout) {
      localStorage.setItem('pendingCheckout', 'true');
      localStorage.setItem('pendingReturnTo', returnTo);
    } else if (returnTo !== '/') {
      localStorage.setItem('pendingReturnTo', returnTo);
    }
    try {
      const { error } = await signInWithApple();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full fixed left-0 top-0"> <Header title={t('app.title')} showBack /> </div>
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">EasyUK</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Sign {isSignUp ? 'up' : 'in'} with Google
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAppleSignIn}
            disabled={loading}
          >
            Sign {isSignUp ? 'up' : 'in'} with Apple
          </Button>
        </div>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
      <BottomNav />
    </div>
    
  );
}
