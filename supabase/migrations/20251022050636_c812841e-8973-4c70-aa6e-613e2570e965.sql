-- Remove Intelligence Desk articles from Voices secondary category
DELETE FROM article_categories
WHERE category_id = (SELECT id FROM categories WHERE slug = 'voices')
AND article_id IN (
  SELECT a.id 
  FROM articles a
  JOIN authors au ON a.author_id = au.id
  WHERE au.name = 'Intelligence Desk'
);