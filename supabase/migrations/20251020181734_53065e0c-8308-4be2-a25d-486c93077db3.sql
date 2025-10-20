-- Backfill published_at for articles that are published but missing the date
UPDATE articles
SET published_at = created_at
WHERE status = 'published' AND published_at IS NULL;