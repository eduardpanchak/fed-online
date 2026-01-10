-- Add new fields to advertisements table for category, languages, and location
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['en']::text[],
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postcode text,
ADD COLUMN IF NOT EXISTS address text;