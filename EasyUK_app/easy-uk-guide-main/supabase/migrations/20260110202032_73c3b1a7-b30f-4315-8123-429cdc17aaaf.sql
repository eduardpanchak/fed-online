-- Create function to get services ordered by seeded hash with premium first
CREATE OR REPLACE FUNCTION public.get_services_seeded_order(seed_value integer)
RETURNS TABLE (
  id uuid,
  service_name text,
  description text,
  category text,
  pricing text,
  photos text[],
  languages text[],
  subscription_tier text,
  latitude double precision,
  longitude double precision,
  postcode text,
  city text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.service_name,
    s.description,
    s.category,
    s.pricing,
    s.photos,
    s.languages,
    s.subscription_tier,
    s.latitude,
    s.longitude,
    s.postcode,
    s.city
  FROM services s
  WHERE s.status IN ('active', 'trial')
  ORDER BY 
    -- Premium/top tier services first
    CASE WHEN s.subscription_tier IN ('top', 'premium') THEN 0 ELSE 1 END,
    -- Within each tier, order by seeded hash
    md5(s.id::text || seed_value::text)
$$;