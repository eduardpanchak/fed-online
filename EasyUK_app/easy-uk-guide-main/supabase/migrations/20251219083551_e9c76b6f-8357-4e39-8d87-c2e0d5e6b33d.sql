-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow moderators to view all services (including suspended) for moderation
CREATE POLICY "Moderators can view all services"
ON public.services
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Allow moderators to update services for moderation actions
CREATE POLICY "Moderators can update services for moderation"
ON public.services
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Allow moderators to delete services
CREATE POLICY "Moderators can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Allow moderators to view all service reports
CREATE POLICY "Moderators can view all reports"
ON public.service_reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Create owner_bans table for tracking banned owners
CREATE TABLE public.owner_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    banned_by UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on owner_bans
ALTER TABLE public.owner_bans ENABLE ROW LEVEL SECURITY;

-- Only moderators/admins can manage bans
CREATE POLICY "Moderators can view bans"
ON public.owner_bans
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can create bans"
ON public.owner_bans
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can delete bans"
ON public.owner_bans
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));