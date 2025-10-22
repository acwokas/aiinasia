-- Enable pg_cron and pg_net extensions for scheduled edge function calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs daily at 9 AM to generate comments for new articles
SELECT cron.schedule(
  'auto-generate-article-comments',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
      url := 'https://ppvifagplcdjpdpqknzt.supabase.co/functions/v1/auto-comment-new-articles',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdmlmYWdwbGNkanBkcHFrbnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjUwOTMsImV4cCI6MjA3NjEwMTA5M30.oYm5mBXB08Cb3HKom1yiHW0leaYrp3rMC6V0A9D8fvA"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);