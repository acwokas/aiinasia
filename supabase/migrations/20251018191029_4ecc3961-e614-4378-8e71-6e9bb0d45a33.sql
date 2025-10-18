-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_stats table for points and progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  level text DEFAULT 'explorer',
  streak_days integer DEFAULT 0,
  last_read_date date,
  articles_read integer DEFAULT 0,
  comments_made integer DEFAULT 0,
  shares_made integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create reading_history table
CREATE TABLE IF NOT EXISTS public.reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false,
  UNIQUE(user_id, article_id)
);

-- Enable RLS on reading_history
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- Reading history policies
CREATE POLICY "Users can view own reading history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reading history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  badge_icon text,
  points_required integer,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Achievements viewable by everyone
CREATE POLICY "Achievements viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create scout_queries table to track daily queries
CREATE TABLE IF NOT EXISTS public.scout_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  query_date date NOT NULL DEFAULT CURRENT_DATE,
  query_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, query_date)
);

-- Enable RLS on scout_queries
ALTER TABLE public.scout_queries ENABLE ROW LEVEL SECURITY;

-- Scout queries policies
CREATE POLICY "Users can view own queries"
  ON public.scout_queries FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own queries"
  ON public.scout_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own queries"
  ON public.scout_queries FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default achievements
INSERT INTO public.achievements (name, description, badge_icon, points_required, category) VALUES
  ('AI Pioneer', 'Read 10 AI articles', '🤖', 100, 'reading'),
  ('Early Adopter', 'Maintain a 7-day reading streak', '🚀', 150, 'streak'),
  ('Thought Leader', 'Make 50 comments', '💡', 250, 'engagement'),
  ('Asia Expert', 'Read articles from all regions', '🌏', 200, 'exploration'),
  ('Bookworm', 'Bookmark 25 articles', '📚', 100, 'collection'),
  ('Social Butterfly', 'Share 20 articles', '🦋', 150, 'sharing'),
  ('News Hound', 'Read 50 news articles', '📰', 300, 'reading'),
  ('Tool Explorer', 'Read 15 tool reviews', '🔧', 150, 'reading')
ON CONFLICT DO NOTHING;