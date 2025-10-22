-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily news scraping at 9 AM UTC every day
SELECT cron.schedule(
  'scrape-newsletter-news-daily',
  '0 9 * * *', -- 9 AM UTC daily
  $$
  SELECT
    net.http_post(
      url:='https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/scrape-newsletter-news',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule weekly newsletter generation on Fridays at 10 AM UTC
SELECT cron.schedule(
  'generate-newsletter-weekly',
  '0 10 * * 5', -- 10 AM UTC every Friday
  $$
  SELECT
    net.http_post(
      url:='https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/generate-weekly-newsletter',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb,
      body:=concat('{"edition_date": "', (CURRENT_DATE + interval '1 day')::text, '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a table to track cron job runs
CREATE TABLE IF NOT EXISTS public.newsletter_automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_automation_log_job_name ON public.newsletter_automation_log(job_name);
CREATE INDEX idx_automation_log_started_at ON public.newsletter_automation_log(started_at DESC);

-- Enable RLS
ALTER TABLE public.newsletter_automation_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
CREATE POLICY "Admins can view automation logs"
ON public.newsletter_automation_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Comment on the scheduled jobs
COMMENT ON EXTENSION pg_cron IS 'Automated newsletter scheduling: Daily news scraping at 9 AM UTC, Weekly newsletter generation on Fridays at 10 AM UTC';