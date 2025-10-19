-- Add preview_code column to articles table for draft previews
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS preview_code text UNIQUE;

-- Create index for faster preview code lookups
CREATE INDEX IF NOT EXISTS idx_articles_preview_code ON public.articles(preview_code) WHERE preview_code IS NOT NULL;