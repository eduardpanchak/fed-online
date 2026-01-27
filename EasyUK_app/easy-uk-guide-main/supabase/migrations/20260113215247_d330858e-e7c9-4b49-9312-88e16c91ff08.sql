-- Add latitude and longitude columns to advertisements table for geocoding
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add index for potential distance-based queries
CREATE INDEX IF NOT EXISTS idx_advertisements_coordinates 
ON public.advertisements (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;