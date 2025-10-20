-- Fix URL-encoded en-dashes in slugs
-- Replace %e2%80%91 (en-dash) with regular hyphen
UPDATE articles
SET slug = REPLACE(slug, '%e2%80%91', '-')
WHERE slug LIKE '%e2%80%91%';

-- Create redirects for old encoded URLs
INSERT INTO redirects (from_path, to_path, status_code)
SELECT 
  '/article/' || slug as from_path,
  '/article/' || REPLACE(slug, '%e2%80%91', '-') as to_path,
  301 as status_code
FROM articles
WHERE slug LIKE '%e2%80%91%'
ON CONFLICT (from_path) DO UPDATE
SET to_path = EXCLUDED.to_path;