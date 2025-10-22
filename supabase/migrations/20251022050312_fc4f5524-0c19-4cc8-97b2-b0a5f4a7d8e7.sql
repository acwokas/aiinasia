-- Recategorize Voices articles to appropriate primary categories
-- All articles by non-Intelligence Desk authors will remain in Voices as secondary category

-- First, get category IDs
DO $$
DECLARE
  news_id uuid := (SELECT id FROM categories WHERE slug = 'news');
  business_id uuid := (SELECT id FROM categories WHERE slug = 'business');
  life_id uuid := (SELECT id FROM categories WHERE slug = 'life');
  learn_id uuid := (SELECT id FROM categories WHERE slug = 'learn');
  create_id uuid := (SELECT id FROM categories WHERE slug = 'create');
  voices_id uuid := (SELECT id FROM categories WHERE slug = 'voices');
BEGIN
  -- Marketing/Business Strategy articles → Business
  UPDATE articles SET primary_category_id = business_id 
  WHERE slug IN (
    'human-first-ai-marketing-asia',
    'building-ai-stack-business-tools-sea',
    'adrians-arena-blink-and-theyre-gone-how-the-fastest-startups-win-with-ai-marketing',
    'adrians-arena-navigating-the-complexities-of-ai-copyright-across-asia',
    'adrians-ai-arena-ai-infused-marketing',
    'adrians-arena-when-will-ai-replace-the-cmo',
    'adrians-arena-the-ai-driven-playbook-for-winning-over-apac-consumers'
  );

  -- Educational/Learning articles → Learn
  UPDATE articles SET primary_category_id = learn_id
  WHERE slug IN (
    'non‑machine‑premium‑future‑work',
    'will-ai-get-you-fired-9-mistakes-that-could-cost-you-everything'
  );

  -- Lifestyle/Personal Experience → Life
  UPDATE articles SET primary_category_id = life_id
  WHERE slug IN (
    'gen-z-apac-ai-dating-trends',
    'adrians-arena-why-i-mostly-switched-from-google-search-to-perplexity-ai'
  );

  -- News/Trends → News
  UPDATE articles SET primary_category_id = news_id
  WHERE slug IN (
    'adrians-arena-what-is-project-stargate-and-how-will-it-impact-asias-ai-future',
    'adrians-arena-ai-and-the-global-shift-what-trumps-2024-victory-means-for-ai-in-asia'
  );

  -- Now add all these articles to Voices as secondary category (article_categories junction table)
  -- Only for articles where author is NOT Intelligence Desk
  INSERT INTO article_categories (article_id, category_id)
  SELECT a.id, voices_id
  FROM articles a
  LEFT JOIN authors au ON a.author_id = au.id
  WHERE a.slug IN (
    'non‑machine‑premium‑future‑work',
    'human-first-ai-marketing-asia',
    'will-ai-get-you-fired-9-mistakes-that-could-cost-you-everything',
    'building-ai-stack-business-tools-sea',
    'adrians-arena-blink-and-theyre-gone-how-the-fastest-startups-win-with-ai-marketing',
    'gen-z-apac-ai-dating-trends',
    'adrians-arena-what-is-project-stargate-and-how-will-it-impact-asias-ai-future',
    'adrians-arena-why-i-mostly-switched-from-google-search-to-perplexity-ai',
    'adrians-arena-navigating-the-complexities-of-ai-copyright-across-asia',
    'adrians-ai-arena-ai-infused-marketing',
    'adrians-arena-when-will-ai-replace-the-cmo',
    'adrians-arena-ai-and-the-global-shift-what-trumps-2024-victory-means-for-ai-in-asia',
    'adrians-arena-the-ai-driven-playbook-for-winning-over-apac-consumers'
  )
  AND au.name != 'Intelligence Desk'
  ON CONFLICT DO NOTHING;
END $$;