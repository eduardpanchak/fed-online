-- Create user_entitlements table for granular entitlement tracking
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ads_active BOOLEAN NOT NULL DEFAULT false,
  ads_expires_at TIMESTAMPTZ,
  top_service_active BOOLEAN NOT NULL DEFAULT false,
  top_service_expires_at TIMESTAMPTZ,
  premium_active BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  revenuecat_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own entitlements"
ON public.user_entitlements
FOR SELECT
USING (auth.uid() = user_id);

-- Only allow server-side updates (via service role or RPC)
CREATE POLICY "Service role can manage entitlements"
ON public.user_entitlements
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON public.user_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create/Update entitlement sync function for RevenueCat webhook
CREATE OR REPLACE FUNCTION public.sync_user_entitlements(
  p_user_id UUID,
  p_ads_active BOOLEAN DEFAULT NULL,
  p_ads_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_top_service_active BOOLEAN DEFAULT NULL,
  p_top_service_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_premium_active BOOLEAN DEFAULT NULL,
  p_premium_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_revenuecat_customer_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_entitlements (
    user_id,
    ads_active,
    ads_expires_at,
    top_service_active,
    top_service_expires_at,
    premium_active,
    premium_expires_at,
    revenuecat_customer_id
  ) VALUES (
    p_user_id,
    COALESCE(p_ads_active, false),
    p_ads_expires_at,
    COALESCE(p_top_service_active, false),
    p_top_service_expires_at,
    COALESCE(p_premium_active, false),
    p_premium_expires_at,
    p_revenuecat_customer_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    ads_active = COALESCE(p_ads_active, user_entitlements.ads_active),
    ads_expires_at = COALESCE(p_ads_expires_at, user_entitlements.ads_expires_at),
    top_service_active = COALESCE(p_top_service_active, user_entitlements.top_service_active),
    top_service_expires_at = COALESCE(p_top_service_expires_at, user_entitlements.top_service_expires_at),
    premium_active = COALESCE(p_premium_active, user_entitlements.premium_active),
    premium_expires_at = COALESCE(p_premium_expires_at, user_entitlements.premium_expires_at),
    revenuecat_customer_id = COALESCE(p_revenuecat_customer_id, user_entitlements.revenuecat_customer_id),
    updated_at = now();
  
  RETURN FOUND;
END;
$$;

-- Function to check if user has active ads entitlement
CREATE OR REPLACE FUNCTION public.has_ads_entitlement(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT ads_active AND (ads_expires_at IS NULL OR ads_expires_at > now())
     FROM public.user_entitlements 
     WHERE user_id = COALESCE(p_user_id, auth.uid())),
    false
  );
$$;

-- Function to check if user has active top_service entitlement
CREATE OR REPLACE FUNCTION public.has_top_service_entitlement(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT top_service_active AND (top_service_expires_at IS NULL OR top_service_expires_at > now())
     FROM public.user_entitlements 
     WHERE user_id = COALESCE(p_user_id, auth.uid())),
    false
  );
$$;

-- Function to check if user has active premium entitlement
CREATE OR REPLACE FUNCTION public.has_premium_entitlement(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT premium_active AND (premium_expires_at IS NULL OR premium_expires_at > now())
     FROM public.user_entitlements 
     WHERE user_id = COALESCE(p_user_id, auth.uid())),
    false
  );
$$;

-- Get all entitlements for user
CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'ads', jsonb_build_object(
      'active', COALESCE(ads_active AND (ads_expires_at IS NULL OR ads_expires_at > now()), false),
      'expires_at', ads_expires_at
    ),
    'top_service', jsonb_build_object(
      'active', COALESCE(top_service_active AND (top_service_expires_at IS NULL OR top_service_expires_at > now()), false),
      'expires_at', top_service_expires_at
    ),
    'premium', jsonb_build_object(
      'active', COALESCE(premium_active AND (premium_expires_at IS NULL OR premium_expires_at > now()), false),
      'expires_at', premium_expires_at
    ),
    'revenuecat_customer_id', revenuecat_customer_id
  )
  FROM public.user_entitlements
  WHERE user_id = COALESCE(p_user_id, auth.uid());
$$;

-- Update publish_ad to check ads entitlement from user_entitlements table
CREATE OR REPLACE FUNCTION public.publish_ad(
  p_media_url TEXT,
  p_media_type TEXT,
  p_target_url TEXT,
  p_request_trial BOOLEAN DEFAULT false,
  p_category TEXT DEFAULT NULL,
  p_languages TEXT[] DEFAULT ARRAY['en'],
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_postcode TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_has_used_trial BOOLEAN;
  v_ads_active BOOLEAN;
  v_ads_expires_at TIMESTAMPTZ;
  v_ad_id UUID;
  v_trial_started_at TIMESTAMPTZ;
  v_trial_ended_at TIMESTAMPTZ;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED', 'message', 'User not authenticated');
  END IF;

  -- Get user's trial status from profiles
  SELECT COALESCE(has_used_ad_trial, false)
  INTO v_has_used_trial
  FROM public.profiles
  WHERE id = v_user_id;

  -- Get user's ads entitlement from user_entitlements
  SELECT 
    COALESCE(ads_active AND (ads_expires_at IS NULL OR ads_expires_at > now()), false),
    ads_expires_at
  INTO v_ads_active, v_ads_expires_at
  FROM public.user_entitlements
  WHERE user_id = v_user_id;

  -- Default to false if no entitlements record
  v_ads_active := COALESCE(v_ads_active, false);

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
    -- Non-trial ad: requires paid ads entitlement
    IF v_ads_active = false THEN
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
      v_ads_expires_at,
      v_ads_expires_at
    )
    RETURNING id INTO v_ad_id;

    RETURN jsonb_build_object(
      'success', true,
      'ad_id', v_ad_id,
      'is_trial', false,
      'paid_until', v_ads_expires_at
    );
  END IF;
END;
$$;

-- Update activate_paid_ad to use user_entitlements
CREATE OR REPLACE FUNCTION public.activate_paid_ad(p_ad_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_ads_active BOOLEAN;
  v_ads_expires_at TIMESTAMPTZ;
  v_ad_user_id UUID;
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

  -- Check ads entitlement from user_entitlements
  SELECT 
    COALESCE(ads_active AND (ads_expires_at IS NULL OR ads_expires_at > now()), false),
    ads_expires_at
  INTO v_ads_active, v_ads_expires_at
  FROM public.user_entitlements
  WHERE user_id = v_user_id;

  IF v_ads_active IS NOT true THEN
    RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_REQUIRED', 'message', 'Active ads subscription required');
  END IF;

  -- Activate the ad
  UPDATE public.advertisements
  SET 
    status = 'active',
    is_paid = true,
    is_trial = false,
    paid_until = v_ads_expires_at,
    expires_at = v_ads_expires_at,
    updated_at = now()
  WHERE id = p_ad_id
    AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'paid_until', v_ads_expires_at);
END;
$$;

-- Create function to publish top-tier service (requires top_service entitlement)
CREATE OR REPLACE FUNCTION public.publish_top_service(
  p_service_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_top_service_active BOOLEAN;
  v_top_service_expires_at TIMESTAMPTZ;
  v_service_user_id UUID;
  v_premium_trial_used BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  -- Verify service ownership
  SELECT user_id INTO v_service_user_id
  FROM public.services
  WHERE id = p_service_id;

  IF v_service_user_id IS NULL OR v_service_user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'SERVICE_NOT_FOUND');
  END IF;

  -- Check premium trial usage from profile
  SELECT COALESCE(premium_trial_used, false)
  INTO v_premium_trial_used
  FROM public.profiles
  WHERE id = v_user_id;

  -- If trial not used, allow one-time trial
  IF v_premium_trial_used IS NOT true THEN
    -- Grant trial
    UPDATE public.services
    SET 
      subscription_tier = 'top',
      status = 'trial',
      trial_start = now(),
      trial_end = now() + interval '14 days',
      updated_at = now()
    WHERE id = p_service_id AND user_id = v_user_id;

    -- Mark trial as used
    UPDATE public.profiles
    SET premium_trial_used = true
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'is_trial', true,
      'trial_ends_at', now() + interval '14 days'
    );
  END IF;

  -- Trial already used, check top_service entitlement
  SELECT 
    COALESCE(top_service_active AND (top_service_expires_at IS NULL OR top_service_expires_at > now()), false),
    top_service_expires_at
  INTO v_top_service_active, v_top_service_expires_at
  FROM public.user_entitlements
  WHERE user_id = v_user_id;

  IF v_top_service_active IS NOT true THEN
    RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_REQUIRED', 'message', 'Active top service subscription required');
  END IF;

  -- Upgrade to top tier with paid subscription
  UPDATE public.services
  SET 
    subscription_tier = 'top',
    status = 'active',
    trial_start = NULL,
    trial_end = NULL,
    updated_at = now()
  WHERE id = p_service_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'is_trial', false,
    'expires_at', v_top_service_expires_at
  );
END;
$$;