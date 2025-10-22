-- Create redirects from old author URLs to new voices URLs
INSERT INTO public.redirects (from_path, to_path, status_code)
SELECT 
  '/author/' || slug AS from_path,
  '/voices/' || slug AS to_path,
  301 AS status_code
FROM public.authors
WHERE slug IS NOT NULL
ON CONFLICT (from_path) DO UPDATE
SET to_path = EXCLUDED.to_path;