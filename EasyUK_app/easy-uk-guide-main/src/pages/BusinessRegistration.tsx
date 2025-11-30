import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function BusinessRegistration() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    pricing: '',
    planType: 'normal' as 'normal' | 'top'
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const categories = [
    'Translation',
    'Legal',
    'Financial',
    'Education',
    'Community',
    'Transport',
    'Healthcare',
    'Beauty',
    'Other'
  ];

  const languages = [
    { code: 'en', name: 'English 🇬🇧' },
    { code: 'uk', name: 'Українська 🇺🇦' },
    { code: 'ru', name: 'Русский 🇷🇺' },
    { code: 'pl', name: 'Polski 🇵🇱' },
    { code: 'lt', name: 'Lietuvių 🇱🇹' },
    { code: 'lv', name: 'Latviešu 🇱🇻' },
    { code: 'ro', name: 'Română 🇷🇴' }
  ];

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.filter(l => l !== code)
        : [...prev, code]
    );
  };

  const handleSubmit = async () => {
    if (!formData.serviceName || !formData.category || selectedLanguages.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to register a business');
      return;
    }

    try {
      // Mark user as business user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_business_user: true } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile to get updated is_business_user status
      await refreshProfile();

      // Mock payment flow
      const price = formData.planType === 'top' ? '£4.99' : '£1.99';
      toast.success(`Service registered! Payment of ${price}/month required.`);
      
      // In a real app, this would integrate with Stripe
      console.log('Business registration:', {
        ...formData,
        languages: selectedLanguages
      });
      
      navigate('/services');
    } catch (error) {
      console.error('Error registering business:', error);
      toast.error('Failed to register business. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Register Your Business" showBack />
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              placeholder="e.g. Ukrainian Translation Services"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available Languages *</Label>
            <div className="space-y-2">
              {languages.map(lang => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={lang.code}
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => handleLanguageToggle(lang.code)}
                  />
                  <label
                    htmlFor={lang.code}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {lang.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing">Pricing (Optional)</Label>
            <Input
              id="pricing"
              placeholder="e.g. £50/hour"
              value={formData.pricing}
              onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Business Plan</Label>
            
            <button
              onClick={() => setFormData({ ...formData, planType: 'normal' })}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                formData.planType === 'normal'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">Normal Listing</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Standard visibility in services list
                  </p>
                </div>
                <span className="font-bold text-primary">£1.99/mo</span>
              </div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, planType: 'top' })}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                formData.planType === 'top'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Top Listing ⭐
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Featured at the top + Pro app access
                  </p>
                </div>
                <span className="font-bold text-primary">£4.99/mo</span>
              </div>
            </button>
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} className="w-full">
              Publish Service
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
