-- Add trial timestamp columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;

-- Add index for efficient trial expiration queries
CREATE INDEX IF NOT EXISTS idx_services_trial_end ON public.services(trial_end) 
WHERE status = 'trial';

-- Add comment to explain trial system
COMMENT ON COLUMN public.services.trial_start IS 'Start date of 14-day free trial period';
COMMENT ON COLUMN public.services.trial_end IS 'End date of 14-day free trial period. After this date, service becomes cancelled if no subscription exists';
