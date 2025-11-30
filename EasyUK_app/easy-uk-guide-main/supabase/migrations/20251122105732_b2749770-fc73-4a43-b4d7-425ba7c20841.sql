-- Create business_profiles table
CREATE TABLE public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_type TEXT,
  services_provided TEXT,
  years_experience INTEGER,
  city_area TEXT,
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT,
  description TEXT,
  photos TEXT[],
  social_links JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('normal', 'top')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'paused')),
  languages TEXT[] NOT NULL,
  stripe_subscription_id TEXT,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_profiles
CREATE POLICY "Users can view their own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for services
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own services"
  ON public.services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();