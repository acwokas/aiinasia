-- Create article_series table
CREATE TABLE IF NOT EXISTS public.article_series (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_series ENABLE ROW LEVEL SECURITY;

-- Create policies for series
CREATE POLICY "Series viewable by everyone" 
ON public.article_series 
FOR SELECT 
USING (true);

CREATE POLICY "Series manageable by admins and editors" 
ON public.article_series 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add series support to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.article_series(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS series_part integer;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS series_total integer;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;

-- Create article_recommendations table
CREATE TABLE IF NOT EXISTS public.article_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own recommendations" 
ON public.article_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations" 
ON public.article_recommendations 
FOR INSERT 
WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(is_trending, published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_series ON articles(series_id, series_part) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON article_recommendations(user_id, score DESC, created_at DESC);

-- Create function to auto-mark trending articles
CREATE OR REPLACE FUNCTION update_trending_articles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset all trending flags
  UPDATE articles SET is_trending = false;
  
  -- Mark top 10 articles from past 7 days as trending based on engagement
  UPDATE articles
  SET is_trending = true
  WHERE id IN (
    SELECT id
    FROM articles
    WHERE status = 'published'
      AND published_at >= NOW() - INTERVAL '7 days'
    ORDER BY (view_count * 1 + like_count * 3 + comment_count * 5) DESC
    LIMIT 10
  );
END;
$$;