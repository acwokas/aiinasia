-- Update the check_and_award_achievements function to include signup achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_stats_rec RECORD;
  user_profile_rec RECORD;
  achievement_rec RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_rec
  FROM public.user_stats
  WHERE user_id = _user_id;

  -- Get user profile for signup achievement checks
  SELECT * INTO user_profile_rec
  FROM public.profiles
  WHERE id = _user_id;

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
       (achievement_rec.name = 'Thought Leader' AND user_stats_rec.level = 'thought_leader') OR
       -- Signup achievements (Digital Pioneer awarded on signup, Profile Master for complete profile)
       (achievement_rec.name = 'Digital Pioneer' AND user_profile_rec.first_name IS NOT NULL) OR
       (achievement_rec.name = 'Profile Master' AND 
        user_profile_rec.first_name IS NOT NULL AND 
        user_profile_rec.avatar_url IS NOT NULL AND 
        user_profile_rec.company IS NOT NULL AND 
        user_profile_rec.job_title IS NOT NULL AND 
        user_profile_rec.interests IS NOT NULL AND 
        array_length(user_profile_rec.interests, 1) >= 3)
    THEN
      -- Award the achievement
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (_user_id, achievement_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;