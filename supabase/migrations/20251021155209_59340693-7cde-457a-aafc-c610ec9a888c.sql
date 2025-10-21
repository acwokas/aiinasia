-- Fix profiles table public exposure
-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

-- Add restricted policy: users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add admin override: admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));