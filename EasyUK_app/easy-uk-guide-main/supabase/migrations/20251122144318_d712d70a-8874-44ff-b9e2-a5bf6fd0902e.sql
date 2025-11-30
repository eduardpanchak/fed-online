-- Update RLS policy to allow viewing services in 'trial' or 'active' status
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

CREATE POLICY "Anyone can view published services"
ON public.services
FOR SELECT
USING (status = 'active' OR status = 'trial');