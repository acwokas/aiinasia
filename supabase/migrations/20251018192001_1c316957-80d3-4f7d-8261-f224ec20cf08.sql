-- Insert predefined achievements
INSERT INTO public.achievements (id, name, description, badge_icon, category, points_required) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Read your first article', '📖', 'reading', 0),
('550e8400-e29b-41d4-a716-446655440002', 'Bookworm', 'Bookmark your first article', '🔖', 'engagement', 0),
('550e8400-e29b-41d4-a716-446655440003', 'Conversationalist', 'Leave your first comment', '💬', 'community', 0),
('550e8400-e29b-41d4-a716-446655440004', 'Newsletter Insider', 'Subscribe to the newsletter', '📧', 'engagement', 0),
('550e8400-e29b-41d4-a716-446655440005', 'Knowledge Seeker', 'Read 10 articles', '🎓', 'reading', 50),
('550e8400-e29b-41d4-a716-446655440006', 'Dedicated Reader', 'Read 50 articles', '📚', 'reading', 250),
('550e8400-e29b-41d4-a716-446655440007', 'AI Scholar', 'Read 100 articles', '🏆', 'reading', 500),
('550e8400-e29b-41d4-a716-446655440008', 'Comment Champion', 'Leave 25 comments', '🗨️', 'community', 150),
('550e8400-e29b-41d4-a716-446655440009', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'engagement', 100),
('550e8400-e29b-41d4-a716-446655440010', 'Month Master', 'Maintain a 30-day streak', '⚡', 'engagement', 500),
('550e8400-e29b-41d4-a716-446655440011', 'Social Sharer', 'Share 10 articles', '🌐', 'engagement', 50),
('550e8400-e29b-41d4-a716-446655440012', 'Explorer', 'Reach Explorer level', '🧭', 'milestone', 0),
('550e8400-e29b-41d4-a716-446655440013', 'Enthusiast', 'Reach Enthusiast level', '⭐', 'milestone', 100),
('550e8400-e29b-41d4-a716-446655440014', 'Expert', 'Reach Expert level', '💎', 'milestone', 500),
('550e8400-e29b-41d4-a716-446655440015', 'Thought Leader', 'Reach Thought Leader level', '👑', 'milestone', 1000)
ON CONFLICT (id) DO NOTHING;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_stats_rec RECORD;
  achievement_rec RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_rec
  FROM public.user_stats
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check all achievements
  FOR achievement_rec IN 
    SELECT a.* 
    FROM public.achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = _user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Check conditions for each achievement
    IF (achievement_rec.name = 'First Steps' AND user_stats_rec.articles_read >= 1) OR
       (achievement_rec.name = 'Knowledge Seeker' AND user_stats_rec.articles_read >= 10) OR
       (achievement_rec.name = 'Dedicated Reader' AND user_stats_rec.articles_read >= 50) OR
       (achievement_rec.name = 'AI Scholar' AND user_stats_rec.articles_read >= 100) OR
       (achievement_rec.name = 'Comment Champion' AND user_stats_rec.comments_made >= 25) OR
       (achievement_rec.name = 'Week Warrior' AND user_stats_rec.streak_days >= 7) OR
       (achievement_rec.name = 'Month Master' AND user_stats_rec.streak_days >= 30) OR
       (achievement_rec.name = 'Social Sharer' AND user_stats_rec.shares_made >= 10) OR
       (achievement_rec.name = 'Explorer' AND user_stats_rec.level = 'explorer') OR
       (achievement_rec.name = 'Enthusiast' AND user_stats_rec.level IN ('enthusiast', 'expert', 'thought_leader')) OR
       (achievement_rec.name = 'Expert' AND user_stats_rec.level IN ('expert', 'thought_leader')) OR
       (achievement_rec.name = 'Thought Leader' AND user_stats_rec.level = 'thought_leader')
    THEN
      -- Award the achievement
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (_user_id, achievement_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Update streak tracking function
CREATE OR REPLACE FUNCTION public.update_streak(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_read date;
  current_streak integer;
BEGIN
  SELECT last_read_date, streak_days INTO last_read, current_streak
  FROM public.user_stats
  WHERE user_id = _user_id;

  IF last_read IS NULL THEN
    -- First read
    UPDATE public.user_stats
    SET last_read_date = CURRENT_DATE,
        streak_days = 1
    WHERE user_id = _user_id;
  ELSIF last_read = CURRENT_DATE THEN
    -- Already read today, do nothing
    RETURN;
  ELSIF last_read = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE public.user_stats
    SET last_read_date = CURRENT_DATE,
        streak_days = streak_days + 1
    WHERE user_id = _user_id;
  ELSE
    -- Streak broken
    UPDATE public.user_stats
    SET last_read_date = CURRENT_DATE,
        streak_days = 1
    WHERE user_id = _user_id;
  END IF;

  -- Check achievements after streak update
  PERFORM public.check_and_award_achievements(_user_id);
END;
$$;

-- Update reading history trigger to include streak tracking
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

    -- Update streak
    PERFORM public.update_streak(NEW.user_id);
    
    -- Check achievements
    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Update bookmark trigger to check achievements
CREATE OR REPLACE FUNCTION public.handle_bookmark_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 5);
    
    -- Check for Bookworm achievement
    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Update comment trigger to check achievements
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

    -- Check for Conversationalist achievement
    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;