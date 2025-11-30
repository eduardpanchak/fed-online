-- Add is_business_user field to profiles table
-- First drop the column if it exists to ensure clean state
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS is_business_user;

-- Add the column with default false
ALTER TABLE public.profiles
ADD COLUMN is_business_user boolean DEFAULT false NOT NULL;