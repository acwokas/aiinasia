-- Create public view for authors without sensitive fields
CREATE VIEW public.authors_public AS
SELECT 
  id, 
  name, 
  slug, 
  bio, 
  avatar_url, 
  twitter_handle, 
  article_count, 
  job_title, 
  created_at, 
  updated_at
FROM public.authors;

-- Grant public access to the view
GRANT SELECT ON public.authors_public TO anon;
GRANT SELECT ON public.authors_public TO authenticated;

-- Update the authors table policy to restrict direct access
DROP POLICY IF EXISTS "Authors viewable by everyone" ON public.authors;

-- Only admins and editors can view full author records (including emails)
CREATE POLICY "Admins and editors view full author data" 
  ON public.authors 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Public and authenticated users must use the view instead