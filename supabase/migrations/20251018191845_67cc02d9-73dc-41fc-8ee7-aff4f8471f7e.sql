-- Function to award points to a user
CREATE OR REPLACE FUNCTION public.award_points(
  _user_id uuid,
  _points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_points integer;
  new_level text;
BEGIN
  -- Add points to user stats
  UPDATE public.user_stats
  SET points = points + _points,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING points INTO new_points;
  
  -- Update level based on points
  IF new_points >= 1000 THEN
    new_level := 'thought_leader';
  ELSIF new_points >= 500 THEN
    new_level := 'expert';
  ELSIF new_points >= 100 THEN
    new_level := 'enthusiast';
  ELSE
    new_level := 'explorer';
  END IF;
  
  UPDATE public.user_stats
  SET level = new_level
  WHERE user_id = _user_id;
END;
$$;

-- Function to handle bookmark points
CREATE OR REPLACE FUNCTION public.handle_bookmark_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for bookmark points
CREATE TRIGGER award_bookmark_points
AFTER INSERT ON public.bookmarks
FOR EACH ROW
EXECUTE FUNCTION public.handle_bookmark_points();

-- Function to handle reading history points
CREATE OR REPLACE FUNCTION public.handle_reading_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award 10 points for reading an article
    PERFORM public.award_points(NEW.user_id, 10);
    
    -- Update articles_read count
    UPDATE public.user_stats
    SET articles_read = articles_read + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for reading history points
CREATE TRIGGER award_reading_points
AFTER INSERT ON public.reading_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_reading_points();

-- Function to handle comment points
CREATE OR REPLACE FUNCTION public.handle_comment_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    -- Award 15 points for commenting
    PERFORM public.award_points(NEW.user_id, 15);
    
    -- Update comments_made count
    UPDATE public.user_stats
    SET comments_made = comments_made + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for comment points
CREATE TRIGGER award_comment_points
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_comment_points();

-- Award points retroactively for existing bookmarks
DO $$
DECLARE
  bookmark_record RECORD;
BEGIN
  FOR bookmark_record IN 
    SELECT user_id, COUNT(*)::integer as bookmark_count
    FROM public.bookmarks
    GROUP BY user_id
  LOOP
    PERFORM public.award_points(bookmark_record.user_id, bookmark_record.bookmark_count * 5);
  END LOOP;
END $$;