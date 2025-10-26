-- ============================================
-- AI in ASIA - Database Schema Export
-- Complete schema structure (NO DATA)
-- ============================================
-- Generated: 2025-01-26
-- Purpose: Rebuild database after corruption
-- ============================================

-- ============================================
-- STEP 1: CREATE ENUMS
-- ============================================

CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE article_type_new AS ENUM ('article', 'news', 'review', 'guide', 'podcast', 'video', 'event');
CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TYPE tool_prompt_category AS ENUM ('tool', 'prompt');
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'contributor', 'user');

-- ============================================
-- STEP 2: CREATE CORE TABLES (NO FOREIGN KEYS YET)
-- ============================================

-- Categories Table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags Table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Authors Table
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  job_title TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievements Table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  points_required INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Article Series Table
CREATE TABLE public.article_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 3: CREATE MAIN CONTENT TABLES
-- ============================================

-- Articles Table (Main content)
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  status article_status NOT NULL DEFAULT 'draft',
  article_type article_type_new NOT NULL DEFAULT 'article',
  
  -- Author & Categories
  author_id UUID REFERENCES public.authors(id),
  primary_category_id UUID REFERENCES public.categories(id),
  
  -- Featured Image
  featured_image_url TEXT,
  featured_image_alt TEXT,
  featured_image_caption TEXT,
  featured_image_credit TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  seo_title TEXT,
  focus_keyphrase TEXT,
  keyphrase_synonyms TEXT,
  canonical_url TEXT,
  
  -- Flags
  featured_on_homepage BOOLEAN DEFAULT false,
  sticky BOOLEAN DEFAULT false,
  cornerstone BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_launch_article BOOLEAN DEFAULT false,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  
  -- AI Features
  ai_summary TEXT,
  ai_tags TEXT[],
  ai_generated_at TIMESTAMPTZ,
  tldr_snapshot JSONB DEFAULT '[]'::jsonb,
  
  -- Series
  series_id UUID REFERENCES public.article_series(id),
  series_part INTEGER,
  series_total INTEGER,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Article Type Specific Fields
  event_date DATE,
  event_start_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  event_location TEXT,
  event_venue TEXT,
  event_registration_url TEXT,
  podcast_audio_url TEXT,
  podcast_duration_minutes INTEGER,
  review_product_name TEXT,
  review_rating NUMERIC,
  
  -- System
  version INTEGER DEFAULT 1,
  batch_id UUID,
  preview_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Events Table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  
  -- Event Details
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  venue TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'APAC',
  
  -- Links
  website_url TEXT,
  registration_url TEXT,
  
  -- Metadata
  event_type TEXT NOT NULL DEFAULT 'conference',
  organizer TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  is_featured BOOLEAN DEFAULT false,
  
  -- System
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- ============================================
-- STEP 4: CREATE RELATIONSHIP TABLES
-- ============================================

-- Article Categories (Many-to-Many)
CREATE TABLE public.article_categories (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- Article Tags (Many-to-Many)
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Comments Table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editor's Picks
CREATE TABLE public.editors_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- ============================================
-- STEP 5: CREATE USER TABLES
-- ============================================

-- User Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  country TEXT,
  interests TEXT[],
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- User Stats
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'explorer',
  articles_read INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  shares_made INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Reading History
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false
);

-- Article Recommendations
CREATE TABLE public.article_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 6: CREATE NEWSLETTER TABLES
-- ============================================

-- Newsletter Subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  confirmed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb,
  points_earned INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Newsletter Editions
CREATE TABLE public.newsletter_editions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_date DATE NOT NULL,
  subject_line TEXT NOT NULL,
  subject_line_variant_b TEXT,
  status newsletter_status NOT NULL DEFAULT 'draft',
  
  -- Content
  hero_article_id UUID REFERENCES public.articles(id),
  hero_article_original UUID,
  hero_article_manual_override BOOLEAN DEFAULT false,
  editor_note TEXT,
  mini_case_study TEXT,
  meme_image_url TEXT,
  meme_caption TEXT,
  meme_alt_text TEXT,
  comments_count_override INTEGER,
  
  -- Sending
  scheduled_send_time TIMESTAMPTZ,
  send_timezone TEXT NOT NULL DEFAULT 'Asia/Singapore',
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  -- System
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Newsletter Top Stories
CREATE TABLE public.newsletter_top_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID NOT NULL REFERENCES public.newsletter_editions(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  original_article_id UUID,
  position INTEGER NOT NULL,
  manual_override BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter Quick Takes
CREATE TABLE public.newsletter_quick_takes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.newsletter_editions(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  insight TEXT NOT NULL,
  source_url TEXT,
  display_order INTEGER,
  manually_selected BOOLEAN DEFAULT false,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter Sends (Tracking)
CREATE TABLE public.newsletter_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID NOT NULL REFERENCES public.newsletter_editions(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  variant TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  clicked_sections JSONB DEFAULT '[]'::jsonb,
  bounced BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ
);

-- Newsletter Sponsors
CREATE TABLE public.newsletter_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  banner_image_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  is_collective_site BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter Tools & Prompts
CREATE TABLE public.newsletter_tools_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category tool_prompt_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  featured_image_url TEXT,
  source TEXT DEFAULT 'PromptandGo',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter Mystery Links
CREATE TABLE public.newsletter_mystery_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  used_in_editions UUID[] DEFAULT ARRAY[]::UUID[],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '60 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Newsletter Fun Facts
CREATE TABLE public.newsletter_fun_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_text TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter News Sources
CREATE TABLE public.newsletter_news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  rss_feed_url TEXT,
  region TEXT DEFAULT 'APAC',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter Automation Log
CREATE TABLE public.newsletter_automation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 7: CREATE UTILITY TABLES
-- ============================================

-- Redirects
CREATE TABLE public.redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- URL Mappings (for migration)
CREATE TABLE public.url_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  old_url TEXT NOT NULL,
  old_slug TEXT NOT NULL,
  new_url TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  article_id UUID REFERENCES public.articles(id),
  batch_id UUID,
  redirect_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration Logs
CREATE TABLE public.migration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_records INTEGER,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Contact Messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scout Queries (AI chatbot tracking)
CREATE TABLE public.scout_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query_date DATE NOT NULL DEFAULT CURRENT_DATE,
  query_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site Settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Popup Settings
CREATE TABLE public.popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  active_popup TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- STEP 8: CREATE VIEWS
-- ============================================

-- Authors Public View (limited fields)
CREATE OR REPLACE VIEW public.authors_public AS
SELECT 
  id,
  name,
  slug,
  bio,
  avatar_url,
  job_title,
  twitter_handle,
  article_count,
  created_at,
  updated_at
FROM public.authors;

-- ============================================
-- STEP 9: CREATE DATABASE FUNCTIONS
-- ============================================

-- Update Updated At Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Alternative timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Set Published At Timestamp
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Update Author Article Count
CREATE OR REPLACE FUNCTION public.update_author_article_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or status change to published
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status != 'published') THEN
    IF NEW.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;

  -- Status change from published
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status != 'published' THEN
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
  END IF;

  -- Delete published article
  IF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
  END IF;

  -- Author change while published
  IF TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status = 'published' AND 
     OLD.author_id IS DISTINCT FROM NEW.author_id THEN
    IF OLD.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = GREATEST(article_count - 1, 0)
      WHERE id = OLD.author_id;
    END IF;
    IF NEW.author_id IS NOT NULL THEN
      UPDATE public.authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Update Trending Articles
CREATE OR REPLACE FUNCTION public.update_trending_articles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset all trending flags
  UPDATE articles SET is_trending = false;
  
  -- Mark top 10 articles from past 7 days as trending
  UPDATE articles
  SET is_trending = true
  WHERE id IN (
    SELECT id
    FROM articles
    WHERE status = 'published'
      AND published_at >= NOW() - INTERVAL '7 days'
    ORDER BY (view_count * 1 + like_count * 3 + comment_count * 5) DESC
    LIMIT 10
  );
END;
$$;

-- User Role Check Function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Handle New User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- Grant Admin to First User
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant admin role to first user only
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Award Points
CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_points integer;
  new_level text;
BEGIN
  -- Add points
  UPDATE public.user_stats
  SET points = points + _points,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING points INTO new_points;
  
  -- Update level
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

-- Update Streak
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
    -- Already read today
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

  PERFORM public.check_and_award_achievements(_user_id);
END;
$$;

-- Check and Award Achievements
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
  SELECT * INTO user_stats_rec
  FROM public.user_stats
  WHERE user_id = _user_id;

  SELECT * INTO user_profile_rec
  FROM public.profiles
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR achievement_rec IN 
    SELECT a.* 
    FROM public.achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = _user_id AND ua.achievement_id = a.id
    )
  LOOP
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
       (achievement_rec.name = 'Digital Pioneer' AND user_profile_rec.first_name IS NOT NULL) OR
       (achievement_rec.name = 'Profile Master' AND 
        user_profile_rec.first_name IS NOT NULL AND 
        user_profile_rec.avatar_url IS NOT NULL AND 
        user_profile_rec.company IS NOT NULL AND 
        user_profile_rec.job_title IS NOT NULL AND 
        user_profile_rec.interests IS NOT NULL AND 
        array_length(user_profile_rec.interests, 1) >= 3)
    THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (_user_id, achievement_rec.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Handle Reading Points
CREATE OR REPLACE FUNCTION public.handle_reading_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 10);
    
    UPDATE public.user_stats
    SET articles_read = articles_read + 1
    WHERE user_id = NEW.user_id;

    PERFORM public.update_streak(NEW.user_id);
    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Handle Bookmark Points
CREATE OR REPLACE FUNCTION public.handle_bookmark_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 5);
    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Handle Comment Points
CREATE OR REPLACE FUNCTION public.handle_comment_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    PERFORM public.award_points(NEW.user_id, 15);
    
    UPDATE public.user_stats
    SET comments_made = comments_made + 1
    WHERE user_id = NEW.user_id;

    PERFORM public.check_and_award_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 10: CREATE TRIGGERS
-- ============================================

-- Timestamp Triggers
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_series_updated_at
  BEFORE UPDATE ON public.article_series
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_newsletter_editions_updated_at
  BEFORE UPDATE ON public.newsletter_editions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_newsletter_sponsors_updated_at
  BEFORE UPDATE ON public.newsletter_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_newsletter_tools_prompts_updated_at
  BEFORE UPDATE ON public.newsletter_tools_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_redirects_updated_at
  BEFORE UPDATE ON public.redirects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_editors_picks_updated_at
  BEFORE UPDATE ON public.editors_picks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Article Triggers
CREATE TRIGGER set_article_published_at
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_at();

CREATE TRIGGER update_author_article_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_author_article_count();

-- User Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_admin();

-- Gamification Triggers
CREATE TRIGGER handle_reading_points_trigger
  AFTER INSERT ON public.reading_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reading_points();

CREATE TRIGGER handle_bookmark_points_trigger
  AFTER INSERT ON public.bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bookmark_points();

CREATE TRIGGER handle_comment_points_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_points();

-- ============================================
-- END OF SCHEMA EXPORT
-- ============================================
-- Next Steps:
-- 1. Run this SQL in batches as shown in the blueprint
-- 2. Enable RLS on all tables (see next file)
-- 3. Create RLS policies (see RLS file)
-- 4. Create storage bucket
-- ============================================
