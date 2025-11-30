-- Make is_business_user nullable to detect new users who haven't selected account type
ALTER TABLE public.profiles 
ALTER COLUMN is_business_user DROP NOT NULL,
ALTER COLUMN is_business_user DROP DEFAULT;

-- Set default to NULL for new users
ALTER TABLE public.profiles 
ALTER COLUMN is_business_user SET DEFAULT NULL;