-- Function to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing to 'published' and published_at is not already set
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update on articles
DROP TRIGGER IF EXISTS auto_set_published_at ON articles;
CREATE TRIGGER auto_set_published_at
  BEFORE INSERT OR UPDATE OF status
  ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();