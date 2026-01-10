-- Drop existing policies on subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Create strengthened policies with explicit authenticated user requirement
CREATE POLICY "Authenticated users can view only their own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert only their own subscription"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update only their own subscription"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment documenting that service role access is intentional for backend operations
COMMENT ON TABLE public.subscriptions IS 'Contains user subscription and Stripe payment data. RLS policies restrict access to authenticated users viewing/modifying only their own records. Service role access is used by edge functions for Stripe webhook processing and subscription management.';