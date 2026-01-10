-- Create enum for moderation status
CREATE TYPE public.moderation_status AS ENUM ('active', 'under_review', 'suspended');

-- Add columns to services table
ALTER TABLE public.services 
ADD COLUMN reports_count INTEGER DEFAULT 0,
ADD COLUMN moderation_status public.moderation_status DEFAULT 'active';

-- Create service_reports table
CREATE TABLE public.service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_report_per_user_service UNIQUE (reporter_user_id, service_id)
);

-- Enable RLS on service_reports
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_reports
CREATE POLICY "Users can create reports"
ON public.service_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports"
ON public.service_reports
FOR SELECT
USING (auth.uid() = reporter_user_id);