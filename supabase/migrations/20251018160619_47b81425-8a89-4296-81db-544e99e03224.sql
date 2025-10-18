-- Add missing website URLs for real events
UPDATE public.events 
SET website_url = 'https://roscon.ros.org/2025/' 
WHERE title = 'ROSCon 2025' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://raysummit.anyscale.com/' 
WHERE title = 'Ray Summit' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://www.futureofaisummit.com/' 
WHERE title = 'Future of AI Summit' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://www.generativeaisummit.ai/' 
WHERE title = 'Generative AI Summit London' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://www.dotai.io/' 
WHERE title = 'dotAI' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://ai-infra-summit.com/' 
WHERE title = 'AI Infra Summit' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://generativeaiweek.com/' 
WHERE title = 'Generative AI Week' AND website_url IS NULL;

UPDATE public.events 
SET website_url = 'https://icgai.org/' 
WHERE title = 'International Conference on Generative AI' AND website_url IS NULL;