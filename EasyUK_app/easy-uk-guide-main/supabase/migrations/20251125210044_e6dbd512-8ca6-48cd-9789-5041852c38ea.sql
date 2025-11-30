-- Add latitude and longitude columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_services_location ON public.services(latitude, longitude);