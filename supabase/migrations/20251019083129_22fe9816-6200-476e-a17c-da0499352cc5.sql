-- Update existing categories to match navigation
UPDATE public.categories SET name = 'Business', slug = 'business', display_order = 2 WHERE slug = 'features';
UPDATE public.categories SET name = 'Voices', slug = 'voices', display_order = 6 WHERE slug = 'opinion';
UPDATE public.categories SET name = 'Create', slug = 'create', display_order = 5 WHERE slug = 'tools';

-- Update News display order
UPDATE public.categories SET display_order = 1 WHERE slug = 'news';

-- Delete Events category (not in navigation)
DELETE FROM public.categories WHERE slug = 'events';

-- Insert missing categories if they don't exist
INSERT INTO public.categories (name, slug, display_order, description)
VALUES 
  ('Learn', 'learn', 3, 'Clear explainers and insights to help you understand the technology and its possibilities.')
ON CONFLICT (slug) DO UPDATE SET display_order = 3;

INSERT INTO public.categories (name, slug, display_order, description)
VALUES 
  ('Live', 'live', 4, 'Stories of how AI is influencing daily life, creativity, and culture across the region.')
ON CONFLICT (slug) DO UPDATE SET display_order = 4;