-- Update the Live category to Life
UPDATE categories
SET name = 'Life',
    slug = 'life'
WHERE name = 'Live';

-- Create redirect to preserve SEO
INSERT INTO redirects (from_path, to_path, status_code)
VALUES ('/category/live', '/category/life', 301)
ON CONFLICT (from_path) DO UPDATE
SET to_path = '/category/life',
    status_code = 301;