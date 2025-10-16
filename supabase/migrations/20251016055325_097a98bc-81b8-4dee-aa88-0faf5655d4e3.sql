-- Create redirects table for URL redirect management
CREATE TABLE public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Policies for redirects table
CREATE POLICY "Redirects viewable by everyone"
ON public.redirects FOR SELECT
USING (true);

CREATE POLICY "Redirects manageable by admins"
ON public.redirects FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_redirects_from_path ON public.redirects(from_path);