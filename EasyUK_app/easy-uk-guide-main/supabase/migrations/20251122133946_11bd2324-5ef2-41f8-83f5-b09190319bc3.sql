-- Create a database function to automatically cancel expired trial services
CREATE OR REPLACE FUNCTION public.cancel_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update services where trial has expired and no active subscription exists
  UPDATE public.services
  SET status = 'cancelled'
  WHERE status = 'trial'
    AND trial_end < now()
    AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '');
    
  -- Log the number of services updated
  RAISE NOTICE 'Cancelled expired trial services';
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.cancel_expired_trials() IS 'Automatically cancels services with expired trials that have no active Stripe subscription. Should be called periodically via pg_cron or external scheduler.';
