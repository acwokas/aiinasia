-- Add flag to mark launch articles (articles that existed before bulk import)
ALTER TABLE public.articles 
ADD COLUMN is_launch_article boolean DEFAULT false;

-- Mark all currently published articles as launch articles
UPDATE public.articles 
SET is_launch_article = true 
WHERE status = 'published';

-- Add index for faster filtering
CREATE INDEX idx_articles_launch ON public.articles(is_launch_article) WHERE is_launch_article = true;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.is_launch_article IS 'Marks articles that existed before bulk WordPress import. Used for rollback/filtering purposes.';