-- Add new article types to the enum
ALTER TYPE article_type_new ADD VALUE IF NOT EXISTS 'event';
ALTER TYPE article_type_new ADD VALUE IF NOT EXISTS 'interview';
ALTER TYPE article_type_new ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE article_type_new ADD VALUE IF NOT EXISTS 'explainer';
ALTER TYPE article_type_new ADD VALUE IF NOT EXISTS 'podcast';

-- Optional: Add event-specific metadata columns to articles table if needed for event type
-- These will be NULL for non-event articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS event_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS event_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS event_venue text,
ADD COLUMN IF NOT EXISTS event_registration_url text;

-- Optional: Add review-specific metadata for review type
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS review_rating numeric(2,1) CHECK (review_rating >= 0 AND review_rating <= 5),
ADD COLUMN IF NOT EXISTS review_product_name text;

-- Optional: Add podcast-specific metadata for podcast type
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS podcast_audio_url text,
ADD COLUMN IF NOT EXISTS podcast_duration_minutes integer;