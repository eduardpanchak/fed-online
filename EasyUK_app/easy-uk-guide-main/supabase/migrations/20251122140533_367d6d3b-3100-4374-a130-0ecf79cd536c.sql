-- Add is_business_user field to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_business_user boolean DEFAULT false NOT NULL;