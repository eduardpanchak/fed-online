-- Drop existing update and delete policies
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete own services" ON public.services;

-- Create new update policy that blocks suspended services
CREATE POLICY "Users can update their own services"
ON public.services
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (moderation_status IS NULL OR moderation_status != 'suspended')
);

-- Create new delete policy that blocks suspended services
CREATE POLICY "Users can delete own services"
ON public.services
FOR DELETE
USING (
  auth.uid() = user_id 
  AND (moderation_status IS NULL OR moderation_status != 'suspended')
);