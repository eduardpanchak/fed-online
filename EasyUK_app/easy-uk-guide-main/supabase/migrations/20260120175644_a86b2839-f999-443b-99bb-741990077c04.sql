-- Step 1: Add trial tracking fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_used_ad_trial boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ad_trial_started_at timestamptz,
ADD COLUMN IF NOT EXISTS ad_trial_ended_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_ad_id uuid;

-- Step 2: Add trial fields to advertisements table
ALTER TABLE public.advertisements
ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_ended_at timestamptz;

-- Step 3: Update existing trial ads to mark profiles as having used trial
UPDATE public.profiles p
SET 
  has_used_ad_trial = true,
  ad_trial_started_at = a.created_at,
  ad_trial_ended_at = a.expires_at,
  trial_ad_id = a.id
FROM public.advertisements a
WHERE a.user_id = p.id;

-- Step 4: Mark existing non-paid ads as trial ads
UPDATE public.advertisements
SET 
  is_trial = true,
  trial_started_at = created_at,
  trial_ended_at = expires_at;

-- Step 5: Create secure function to create an advertisement (enforces trial rules)
CREATE OR REPLACE FUNCTION public.create_advertisement(
  p_media_url text,
  p_media_type text,
  p_target_url text,
  p_category text DEFAULT NULL,
  p_languages text[] DEFAULT ARRAY['en'],
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_postcode text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_has_used_trial boolean;
  v_ad_id uuid;
  v_is_trial boolean;
  v_status text;
  v_expires_at timestamptz;
  v_trial_started_at timestamptz;
  v_trial_ended_at timestamptz;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user has already used their trial
  SELECT has_used_ad_trial INTO v_has_used_trial
  FROM public.profiles
  WHERE id = v_user_id;

  -- Determine if this is a trial ad
  IF v_has_used_trial = true OR v_has_used_trial IS NULL THEN
    -- User has used trial or profile doesn't exist, requires payment
    v_is_trial := false;
    v_status := 'payment_required';
    v_expires_at := now(); -- Will be updated when paid
    v_trial_started_at := NULL;
    v_trial_ended_at := NULL;
  ELSE
    -- First ad, grant 7-day trial
    v_is_trial := true;
    v_status := 'active';
    v_trial_started_at := now();
    v_trial_ended_at := now() + interval '7 days';
    v_expires_at := v_trial_ended_at;
  END IF;

  -- Create the advertisement
  INSERT INTO public.advertisements (
    user_id,
    media_url,
    media_type,
    target_url,
    category,
    languages,
    country,
    city,
    postcode,
    address,
    latitude,
    longitude,
    status,
    is_trial,
    is_paid,
    expires_at,
    trial_started_at,
    trial_ended_at
  ) VALUES (
    v_user_id,
    p_media_url,
    p_media_type,
    p_target_url,
    p_category,
    p_languages,
    p_country,
    p_city,
    p_postcode,
    p_address,
    p_latitude,
    p_longitude,
    v_status,
    v_is_trial,
    false,
    v_expires_at,
    v_trial_started_at,
    v_trial_ended_at
  )
  RETURNING id INTO v_ad_id;

  -- If this was a trial, mark the profile as having used trial
  IF v_is_trial THEN
    UPDATE public.profiles
    SET 
      has_used_ad_trial = true,
      ad_trial_started_at = v_trial_started_at,
      ad_trial_ended_at = v_trial_ended_at,
      trial_ad_id = v_ad_id
    WHERE id = v_user_id;
  END IF;

  RETURN v_ad_id;
END;
$$;

-- Step 6: Create function to check if user can get trial
CREATE OR REPLACE FUNCTION public.can_get_ad_trial()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT NOT has_used_ad_trial FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Step 7: Create function to activate ad after payment
CREATE OR REPLACE FUNCTION public.activate_paid_ad(p_ad_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only allow activation of user's own ads that require payment
  UPDATE public.advertisements
  SET 
    status = 'active',
    is_paid = true,
    paid_until = now() + interval '30 days',
    expires_at = now() + interval '30 days',
    updated_at = now()
  WHERE id = p_ad_id
    AND user_id = v_user_id
    AND (status = 'payment_required' OR (is_trial = true AND expires_at < now()));

  RETURN FOUND;
END;
$$;

-- Step 8: Drop existing INSERT policy and create restricted one
DROP POLICY IF EXISTS "Users can insert their own ads" ON public.advertisements;

-- New INSERT policy - only allows inserts via the RPC function
-- Direct inserts are blocked, users must use create_advertisement()
CREATE POLICY "Users can insert ads via function only"
ON public.advertisements
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Step 9: Update UPDATE policy to prevent manipulation of trial fields
DROP POLICY IF EXISTS "Users can update their own ads" ON public.advertisements;

CREATE POLICY "Users can update their own ads safely"
ON public.advertisements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Prevent changing trial-related fields (they stay the same as before)
  AND is_trial = (SELECT is_trial FROM public.advertisements WHERE id = advertisements.id)
  AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM public.advertisements WHERE id = advertisements.id)
  AND trial_ended_at IS NOT DISTINCT FROM (SELECT trial_ended_at FROM public.advertisements WHERE id = advertisements.id)
  -- Prevent setting status to active without going through proper flow
  AND (
    status = (SELECT status FROM public.advertisements WHERE id = advertisements.id)
    OR status IN ('draft', 'expired')
  )
);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_advertisement TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_get_ad_trial TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_ad TO authenticated;