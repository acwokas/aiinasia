-- Function to update author article count
CREATE OR REPLACE FUNCTION public.update_author_article_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If article is being inserted or updated to published status
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status != 'published') THEN
    -- Increment count for the new author
    IF NEW.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;

  -- If article is being updated from published to another status
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status != 'published' THEN
    -- Decrement count for the old author
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
  END IF;

  -- If article is being deleted and was published
  IF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    -- Decrement count for the author
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
  END IF;

  -- If article author is being changed while published
  IF TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status = 'published' AND 
     OLD.author_id IS DISTINCT FROM NEW.author_id THEN
    -- Decrement old author's count
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
    -- Increment new author's count
    IF NEW.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for article changes
DROP TRIGGER IF EXISTS trigger_update_author_article_count ON public.articles;
CREATE TRIGGER trigger_update_author_article_count
AFTER INSERT OR UPDATE OR DELETE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_author_article_count();

-- Recalculate all article counts to fix existing data
UPDATE public.authors
SET article_count = (
  SELECT COUNT(*)
  FROM public.articles
  WHERE articles.author_id = authors.id
  AND articles.status = 'published'
);