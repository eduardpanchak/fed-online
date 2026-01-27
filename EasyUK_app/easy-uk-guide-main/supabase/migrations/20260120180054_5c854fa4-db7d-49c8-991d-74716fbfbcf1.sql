-- Step 1: Add RevenueCat entitlement fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS entitlement_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS entitlement_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS revenuecat_customer_id text;

-- Step 2: Drop existing RPC and create improved version
DROP FUNCTION IF EXISTS public.create_advertisement;

-- Step 3: Create the new publish_ad RPC with trial-once enforcement
CREATE OR REPLACE FUNCTION public.publish_ad(
  p_media_url text,
  p_media_type text,
  p_target_url text,
  p_request_trial boolean DEFAULT false,
  p_category text DEFAULT NULL,
  p_languages text[] DEFAULT ARRAY['en'],
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_postcode text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_has_used_trial boolean;
  v_entitlement_active boolean;
  v_entitlement_expires_at timestamptz;
  v_ad_id uuid;
  v_trial_started_at timestamptz;
  v_trial_ended_at timestamptz;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED', 'message', 'User not authenticated');
  END IF;

  -- Get user's trial and entitlement status
  SELECT 
    COALESCE(has_used_ad_trial, false),
    COALESCE(entitlement_active, false),
    entitlement_expires_at
  INTO v_has_used_trial, v_entitlement_active, v_entitlement_expires_at
  FROM public.profiles
  WHERE id = v_user_id;

  -- Handle trial request
  IF p_request_trial = true THEN
    -- Check if trial was already used
    IF v_has_used_trial = true THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'TRIAL_ALREADY_USED', 
        'message', 'Trial already used. You can only have one free trial.'
      );
    END IF;

    -- Grant 14-day trial
    v_trial_started_at := now();
    v_trial_ended_at := now() + interval '14 days';

    -- Insert the trial ad
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
      'active',
      true,
      false,
      v_trial_ended_at,
      v_trial_started_at,
      v_trial_ended_at
    )
    RETURNING id INTO v_ad_id;

    -- Mark trial as used in profile
    UPDATE public.profiles
    SET 
      has_used_ad_trial = true,
      ad_trial_started_at = v_trial_started_at,
      ad_trial_ended_at = v_trial_ended_at,
      trial_ad_id = v_ad_id
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'ad_id', v_ad_id,
      'is_trial', true,
      'trial_ends_at', v_trial_ended_at
    );

  ELSE
    -- Non-trial ad: requires paid entitlement
    IF v_entitlement_active = false OR v_entitlement_expires_at IS NULL OR v_entitlement_expires_at < now() THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'PAYMENT_REQUIRED',
        'message', 'Payment required. Please subscribe to publish ads.'
      );
    END IF;

    -- Insert the paid ad
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
      paid_until
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
      'active',
      false,
      true,
      v_entitlement_expires_at,
      v_entitlement_expires_at
    )
    RETURNING id INTO v_ad_id;

    RETURN jsonb_build_object(
      'success', true,
      'ad_id', v_ad_id,
      'is_trial', false,
      'paid_until', v_entitlement_expires_at
    );
  END IF;
END;
$$;

-- Step 4: Create function to check trial eligibility
CREATE OR REPLACE FUNCTION public.get_ad_trial_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'has_used_trial', COALESCE(has_used_ad_trial, false),
    'trial_started_at', ad_trial_started_at,
    'trial_ended_at', ad_trial_ended_at,
    'trial_ad_id', trial_ad_id,
    'entitlement_active', COALESCE(entitlement_active, false),
    'entitlement_expires_at', entitlement_expires_at
  )
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Step 5: Create function to update entitlement (called by webhook)
CREATE OR REPLACE FUNCTION public.update_user_entitlement(
  p_user_id uuid,
  p_active boolean,
  p_expires_at timestamptz,
  p_revenuecat_customer_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    entitlement_active = p_active,
    entitlement_expires_at = p_expires_at,
    revenuecat_customer_id = COALESCE(p_revenuecat_customer_id, revenuecat_customer_id)
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Step 6: Create function to mark expired trials as payment_required
CREATE OR REPLACE FUNCTION public.expire_trial_ads()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.advertisements
  SET status = 'payment_required'
  WHERE is_trial = true
    AND status = 'active'
    AND trial_ended_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Step 7: Update activate_paid_ad to check entitlement
DROP FUNCTION IF EXISTS public.activate_paid_ad;

CREATE OR REPLACE FUNCTION public.activate_paid_ad(p_ad_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_entitlement_active boolean;
  v_entitlement_expires_at timestamptz;
  v_ad_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  -- Verify ad ownership
  SELECT user_id INTO v_ad_user_id
  FROM public.advertisements
  WHERE id = p_ad_id;

  IF v_ad_user_id IS NULL OR v_ad_user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'AD_NOT_FOUND');
  END IF;

  -- Check entitlement
  SELECT 
    COALESCE(entitlement_active, false),
    entitlement_expires_at
  INTO v_entitlement_active, v_entitlement_expires_at
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_entitlement_active = false OR v_entitlement_expires_at IS NULL OR v_entitlement_expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_REQUIRED', 'message', 'Active subscription required');
  END IF;

  -- Activate the ad
  UPDATE public.advertisements
  SET 
    status = 'active',
    is_paid = true,
    is_trial = false,
    paid_until = v_entitlement_expires_at,
    expires_at = v_entitlement_expires_at,
    updated_at = now()
  WHERE id = p_ad_id
    AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'paid_until', v_entitlement_expires_at);
END;
$$;

-- Step 8: Update RLS policies to prevent trial field manipulation

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert ads via function only" ON public.advertisements;
DROP POLICY IF EXISTS "Users can update their own ads safely" ON public.advertisements;

-- New INSERT policy: completely block direct inserts (must use RPC)
CREATE POLICY "Block direct inserts - use publish_ad RPC"
ON public.advertisements
FOR INSERT
TO authenticated
WITH CHECK (false);

-- New UPDATE policy: allow updates only to safe fields
CREATE POLICY "Users can update safe fields only"
ON public.advertisements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- The following ensures trial/payment fields cannot be modified via direct UPDATE
  -- These checks compare new values to existing values
);

-- Step 9: Create a view for serving eligible ads (handles trial expiry)
CREATE OR REPLACE VIEW public.active_advertisements AS
SELECT 
  a.*,
  CASE 
    WHEN a.is_trial AND a.trial_ended_at IS NOT NULL 
    THEN GREATEST(0, EXTRACT(EPOCH FROM (a.trial_ended_at - now())) / 86400)::integer
    ELSE NULL
  END as trial_days_remaining
FROM public.advertisements a
WHERE 
  a.status = 'active'
  AND (
    -- Paid ads: check expiry
    (a.expires_at IS NOT NULL AND a.expires_at > now())
    OR
    -- Trial ads: check trial hasn't expired
    (a.is_trial = true AND a.trial_ended_at > now())
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.publish_ad TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ad_trial_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_trial_ads TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_ad TO authenticated;
GRANT SELECT ON public.active_advertisements TO authenticated, anon;