-- Fix the security definer view issue by using security_invoker
DROP VIEW IF EXISTS public.active_advertisements;

CREATE VIEW public.active_advertisements
WITH (security_invoker = on)
AS
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
GRANT SELECT ON public.active_advertisements TO authenticated, anon;