-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto-comment job to run daily at 2 AM UTC
SELECT cron.schedule(
  'auto-comment-new-articles',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/auto-comment-new-articles',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb
    ) as request_id;
  $$
);