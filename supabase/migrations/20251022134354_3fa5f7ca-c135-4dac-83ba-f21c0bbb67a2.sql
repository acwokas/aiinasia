-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create popup settings table
CREATE TABLE IF NOT EXISTS public.popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  active_popup TEXT NOT NULL DEFAULT 'none' CHECK (active_popup IN ('none', 'newsletter', 'welcome')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.popup_settings (active_popup) VALUES ('welcome')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view popup settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can update popup settings" ON public.popup_settings;

-- Allow everyone to read settings
CREATE POLICY "Anyone can view popup settings"
ON public.popup_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update popup settings"
ON public.popup_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'editor')
  )
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_popup_settings_updated_at ON public.popup_settings;
CREATE TRIGGER update_popup_settings_updated_at
BEFORE UPDATE ON public.popup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();