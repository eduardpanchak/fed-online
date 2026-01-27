-- Drop and recreate get_services_seeded_order function to include country and borough
DROP FUNCTION IF EXISTS public.get_services_seeded_order(integer);

CREATE FUNCTION public.get_services_seeded_order(seed_value integer)
RETURNS TABLE(
  category text,
  city text,
  description text,
  id uuid,
  languages text[],
  latitude double precision,
  longitude double precision,
  photos text[],
  postcode text,
  pricing text,
  service_name text,
  subscription_tier text,
  country text,
  borough text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.category,
    s.city,
    s.description,
    s.id,
    s.languages,
    s.latitude,
    s.longitude,
    s.photos,
    s.postcode,
    s.pricing,
    s.service_name,
    s.subscription_tier,
    s.country,
    s.borough
  FROM services s
  WHERE s.status IN ('active', 'trial')
    AND (s.moderation_status IS NULL OR s.moderation_status = 'active')
  ORDER BY 
    CASE WHEN s.subscription_tier = 'top' THEN 0 ELSE 1 END,
    (hashtext(s.id::text || seed_value::text) % 1000000);
END;
$$;