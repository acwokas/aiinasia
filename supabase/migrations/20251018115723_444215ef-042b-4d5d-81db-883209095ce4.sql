-- Add SEO Title and Keyphrase synonyms columns to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS keyphrase_synonyms text;