-- Add job_title column to authors table
ALTER TABLE public.authors
ADD COLUMN job_title TEXT;