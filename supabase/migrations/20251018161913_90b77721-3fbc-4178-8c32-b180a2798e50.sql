-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

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
