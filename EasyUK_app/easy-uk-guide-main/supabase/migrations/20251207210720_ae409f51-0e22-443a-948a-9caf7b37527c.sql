-- Add location fields to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United Kingdom',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT;