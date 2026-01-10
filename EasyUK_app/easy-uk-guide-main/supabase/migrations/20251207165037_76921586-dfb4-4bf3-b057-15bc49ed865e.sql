-- Create function to increment view count atomically
CREATE OR REPLACE FUNCTION public.increment_view_count(service_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.services 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = service_id;
END;
$$;

-- Create function to increment click count atomically
CREATE OR REPLACE FUNCTION public.increment_click_count(service_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.services 
  SET click_count = COALESCE(click_count, 0) + 1 
  WHERE id = service_id;
END;
$$;