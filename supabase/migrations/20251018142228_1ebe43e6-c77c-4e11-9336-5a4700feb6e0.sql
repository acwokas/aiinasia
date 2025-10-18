-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Create a cron job to publish scheduled articles every 5 minutes
-- This job will call the edge function that checks for articles to publish
SELECT cron.schedule(
  'publish-scheduled-articles',
  '*/5 * * * *', -- Run every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/publish-scheduled-articles',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);