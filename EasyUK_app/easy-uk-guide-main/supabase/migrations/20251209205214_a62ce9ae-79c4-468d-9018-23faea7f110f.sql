-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  target_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own ads
CREATE POLICY "Users can view their own ads"
ON public.advertisements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active ads"
ON public.advertisements
FOR SELECT
USING (true);


-- Policy: Anyone can view active ads (for the feed)

-- CREATE POLICY "Anyone can view active ads"
-- ON public.advertisements
-- FOR SELECT
-- USING (status = 'active' AND expires_at > now());

-- Policy: Users can insert their own ads
CREATE POLICY "Users can insert their own ads"
ON public.advertisements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ads
CREATE POLICY "Users can update their own ads"
ON public.advertisements
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own ads
CREATE POLICY "Users can delete their own ads"
ON public.advertisements
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for ad media
INSERT INTO storage.buckets (id, name, public) VALUES ('advertisements', 'advertisements', true);

-- Storage policies for advertisements bucket
CREATE POLICY "Authenticated users can upload ad media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'advertisements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view ad media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'advertisements');

CREATE POLICY "Users can delete their own ad media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'advertisements' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION public.increment_ad_impressions(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advertisements 
  SET impressions = impressions + 1 
  WHERE id = ad_id;
END;
$$;

-- Function to increment ad clicks
CREATE OR REPLACE FUNCTION public.increment_ad_clicks(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advertisements 
  SET clicks = clicks + 1 
  WHERE id = ad_id;
END;
$$;




-- new added 10/12/2025 

-- Функция для увеличения показов
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE advertisements
  SET 
    impressions = COALESCE(impressions, 0) + 1,
    last_shown = NOW()
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для увеличения кликов
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE advertisements
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Убедитесь что колонки существуют
ALTER TABLE advertisements 
ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_shown TIMESTAMP WITH TIME ZONE;

-- Индекс для быстрой сортировки
CREATE INDEX IF NOT EXISTS idx_ads_impressions 
ON advertisements(impressions ASC, status);