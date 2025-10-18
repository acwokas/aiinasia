-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing schedule with the same name
SELECT cron.unschedule('scrape-ai-events-monthly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'scrape-ai-events-monthly'
);

-- Schedule the AI events scraper to run on the 1st of every month at 9:00 AM UTC
SELECT cron.schedule(
  'scrape-ai-events-monthly',
  '0 9 1 * *', -- At 9:00 AM on the 1st day of every month
  $$
  SELECT
    net.http_post(
        url:='https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/scrape-ai-events',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
