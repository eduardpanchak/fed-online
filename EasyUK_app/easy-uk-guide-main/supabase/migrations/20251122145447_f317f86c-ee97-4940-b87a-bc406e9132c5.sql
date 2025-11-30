-- Fix CHECK constraints to match application code

-- Update status constraint to allow trial and cancelled
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_status_check;
ALTER TABLE public.services ADD CONSTRAINT services_status_check 
  CHECK (status IN ('active', 'pending', 'trial', 'cancelled', 'inactive', 'paused'));

-- Update subscription_tier constraint to use 'standard' instead of 'normal'
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_subscription_tier_check;
ALTER TABLE public.services ADD CONSTRAINT services_subscription_tier_check 
  CHECK (subscription_tier IN ('standard', 'top'));