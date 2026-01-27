-- Add borough column to services table for London borough filtering
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS borough text;

-- Create index for efficient borough filtering
CREATE INDEX IF NOT EXISTS idx_services_borough ON public.services(borough);

-- Create index for country filtering (country column already exists)
CREATE INDEX IF NOT EXISTS idx_services_country ON public.services(country);