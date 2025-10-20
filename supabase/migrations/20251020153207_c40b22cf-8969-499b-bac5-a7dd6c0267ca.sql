-- Add tldr_snapshot column to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS tldr_snapshot jsonb DEFAULT '[]'::jsonb;