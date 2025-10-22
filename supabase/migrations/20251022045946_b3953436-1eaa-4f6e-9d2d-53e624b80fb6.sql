-- Update category descriptions with new intro content
UPDATE public.categories
SET description = 'Asia''s AI story unfolds here. Catch the latest AI news in Asia, from breakthroughs in machine learning to bold government moves and startup launches redefining the region''s tech future.'
WHERE slug = 'news';

UPDATE public.categories
SET description = 'From boardrooms to startups, see how AI is transforming business in Asia. Smart strategies, sharp insights, and real-world case studies showing how companies turn intelligence into growth.'
WHERE slug = 'business';

UPDATE public.categories
SET description = 'Your go-to AI learning hub for clear explainers, how-tos, and deep dives that make complex topics simple. Master the tools and trends shaping the future of work and innovation in Asia.'
WHERE slug = 'learn';

UPDATE public.categories
SET description = 'Where AI meets daily life. From creative tools to workplace shifts, explore how technology is reshaping how Asia lives, works, and plays.'
WHERE slug = 'life';

UPDATE public.categories
SET description = 'Get hands-on with AI tools for creators. Find prompts, experiments, and inspiration to help you build smarter, faster, and more creatively across Asia''s growing AI ecosystem.'
WHERE slug = 'create';

UPDATE public.categories
SET description = 'Opinion and perspective from AI thought leaders in Asia. Bold takes, grounded insight, and lively debate from the thinkers defining where the region''s AI story goes next.'
WHERE slug = 'voices';