-- Add batch_id to articles table to track import batches
ALTER TABLE public.articles 
ADD COLUMN batch_id uuid;

-- Add index for faster lookups
CREATE INDEX idx_articles_batch_id ON public.articles(batch_id);

-- Add batch_id to url_mappings for consistency
ALTER TABLE public.url_mappings 
ADD COLUMN batch_id uuid;

CREATE INDEX idx_url_mappings_batch_id ON public.url_mappings(batch_id);