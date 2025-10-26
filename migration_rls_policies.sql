-- ============================================
-- AI in ASIA - Row Level Security Policies
-- Enable RLS and create policies
-- ============================================
-- Run AFTER creating all tables and functions
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editors_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_automation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_fun_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_mystery_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_quick_takes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_tools_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_top_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: CREATE RLS POLICIES
-- ============================================

-- ACHIEVEMENTS
CREATE POLICY "Achievements viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- ARTICLE_CATEGORIES
CREATE POLICY "Article categories viewable by everyone"
  ON public.article_categories FOR SELECT
  USING (true);

CREATE POLICY "Article categories manageable by admins and editors"
  ON public.article_categories FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- ARTICLE_RECOMMENDATIONS
CREATE POLICY "Users can view own recommendations"
  ON public.article_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
  ON public.article_recommendations FOR INSERT
  WITH CHECK (true);

-- ARTICLE_SERIES
CREATE POLICY "Series viewable by everyone"
  ON public.article_series FOR SELECT
  USING (true);

CREATE POLICY "Series manageable by admins and editors"
  ON public.article_series FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- ARTICLE_TAGS
CREATE POLICY "Article tags viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (true);

CREATE POLICY "Article tags manageable by admins and editors"
  ON public.article_tags FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- ARTICLES
CREATE POLICY "Published articles viewable by everyone"
  ON public.articles FOR SELECT
  USING (
    status = 'published' OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'editor') OR 
    (has_role(auth.uid(), 'contributor') AND created_by = auth.uid())
  );

CREATE POLICY "Articles manageable by admins and editors"
  ON public.articles FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'editor') OR 
    has_role(auth.uid(), 'contributor')
  );

CREATE POLICY "Articles updatable by admins and editors"
  ON public.articles FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'editor') OR 
    (has_role(auth.uid(), 'contributor') AND created_by = auth.uid())
  );

CREATE POLICY "Articles deletable by admins"
  ON public.articles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- AUTHORS
CREATE POLICY "Admins and editors view full author data"
  ON public.authors FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Authors manageable by admins and editors"
  ON public.authors FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- BOOKMARKS
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Categories manageable by admins"
  ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- COMMENTS
CREATE POLICY "Approved comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (
    approved = true OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Comments manageable by admins and editors"
  ON public.comments FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Comments deletable by admins"
  ON public.comments FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- CONTACT_MESSAGES
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages"
  ON public.contact_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- EDITORS_PICKS
CREATE POLICY "Editor's picks viewable by everyone"
  ON public.editors_picks FOR SELECT
  USING (true);

CREATE POLICY "Editor's picks manageable by admins and editors"
  ON public.editors_picks FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- EVENTS
CREATE POLICY "Events viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Events manageable by admins and editors"
  ON public.events FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- MIGRATION_LOGS
CREATE POLICY "Admins can view migration logs"
  ON public.migration_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert migration logs"
  ON public.migration_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update migration logs"
  ON public.migration_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete migration logs"
  ON public.migration_logs FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- NEWSLETTER_AUTOMATION_LOG
CREATE POLICY "Admins can view automation logs"
  ON public.newsletter_automation_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- NEWSLETTER_EDITIONS
CREATE POLICY "Public can view sent newsletters"
  ON public.newsletter_editions FOR SELECT
  USING (status = 'sent');

CREATE POLICY "Admins can manage newsletter editions"
  ON public.newsletter_editions FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_FUN_FACTS
CREATE POLICY "Public can view active fun facts"
  ON public.newsletter_fun_facts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage fun facts"
  ON public.newsletter_fun_facts FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_MYSTERY_LINKS
CREATE POLICY "Admins can manage mystery links"
  ON public.newsletter_mystery_links FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_NEWS_SOURCES
CREATE POLICY "Admins can manage news sources"
  ON public.newsletter_news_sources FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_QUICK_TAKES
CREATE POLICY "Public can view quick takes of sent newsletters"
  ON public.newsletter_quick_takes FOR SELECT
  USING (
    edition_id IS NULL OR
    EXISTS (
      SELECT 1 FROM newsletter_editions
      WHERE id = edition_id AND status = 'sent'
    )
  );

CREATE POLICY "Admins can manage quick takes"
  ON public.newsletter_quick_takes FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_SENDS
CREATE POLICY "Admins can view all sends"
  ON public.newsletter_sends FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "System can insert sends"
  ON public.newsletter_sends FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sends"
  ON public.newsletter_sends FOR UPDATE
  USING (true);

-- NEWSLETTER_SPONSORS
CREATE POLICY "Public can view active sponsors"
  ON public.newsletter_sponsors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage sponsors"
  ON public.newsletter_sponsors FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_SUBSCRIBERS
CREATE POLICY "Newsletter signup by anyone"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Newsletter subscribers manageable by admins"
  ON public.newsletter_subscribers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- NEWSLETTER_TOOLS_PROMPTS
CREATE POLICY "Public can view active tools and prompts"
  ON public.newsletter_tools_prompts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tools and prompts"
  ON public.newsletter_tools_prompts FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- NEWSLETTER_TOP_STORIES
CREATE POLICY "Public can view top stories of sent newsletters"
  ON public.newsletter_top_stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM newsletter_editions
      WHERE id = edition_id AND status = 'sent'
    )
  );

CREATE POLICY "Admins can manage top stories"
  ON public.newsletter_top_stories FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- POPUP_SETTINGS
CREATE POLICY "Anyone can view popup settings"
  ON public.popup_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update popup settings"
  ON public.popup_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- READING_HISTORY
CREATE POLICY "Users can view own reading history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own reading history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own reading history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reading history"
  ON public.reading_history FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- REDIRECTS
CREATE POLICY "Redirects viewable by everyone"
  ON public.redirects FOR SELECT
  USING (true);

CREATE POLICY "Redirects manageable by admins"
  ON public.redirects FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- SCOUT_QUERIES
CREATE POLICY "Users can view own queries"
  ON public.scout_queries FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert own queries"
  ON public.scout_queries FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update own queries"
  ON public.scout_queries FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete scout queries"
  ON public.scout_queries FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- SITE_SETTINGS
CREATE POLICY "Admins can view settings"
  ON public.site_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- TAGS
CREATE POLICY "Tags viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Tags manageable by admins and editors"
  ON public.tags FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- URL_MAPPINGS
CREATE POLICY "Admins can view url mappings"
  ON public.url_mappings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert url mappings"
  ON public.url_mappings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update url mappings"
  ON public.url_mappings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete url mappings"
  ON public.url_mappings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- USER_ACHIEVEMENTS
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user achievements"
  ON public.user_achievements FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user achievements"
  ON public.user_achievements FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- USER_ROLES
CREATE POLICY "User roles viewable by admins"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "User roles manageable by admins only"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- USER_STATS
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user stats"
  ON public.user_stats FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- END OF RLS POLICIES
-- ============================================
