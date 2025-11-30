-- Add missing columns to services table for service contact and location info
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Update existing services to have trial status if they were pending
UPDATE public.services 
SET status = 'trial' 
WHERE status = 'pending';

-- Add comment to explain status values
COMMENT ON COLUMN public.services.status IS 'Service status: trial (14-day free trial), active (paid subscription), pending (awaiting approval), cancelled (subscription ended)';
