-- Add additional fields to profiles table for better customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[], -- Array of interest categories
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT false;

-- Add comment explaining the table structure
COMMENT ON COLUMN public.profiles.interests IS 'User interests for feed customization (e.g., AI, ML, Robotics, etc.)';
COMMENT ON COLUMN public.profiles.newsletter_subscribed IS 'Whether user opted in to newsletter during signup';