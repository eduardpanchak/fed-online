import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Briefcase } from 'lucide-react';

export default function SelectAccountType() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = (location.state as any)?.returnTo || '/';
  const showCheckout = (location.state as any)?.showCheckout || false;

  const handleAccountTypeSelect = (accountType: 'regular' | 'business') => {
    navigate('/auth', { 
      state: { 
        accountType,
        returnTo,
        showCheckout,
        isSignUp: true
      } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Choose Account Type</h1>
          <p className="text-muted-foreground">Select the type of account you want to create</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAccountTypeSelect('regular')}
            className="w-full p-6 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Regular Account</h3>
                <p className="text-sm text-muted-foreground">Access services and information</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAccountTypeSelect('business')}
            className="w-full p-6 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Business Account</h3>
                <p className="text-sm text-muted-foreground">Provide services to users</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </Card>
    </div>
  );
}
