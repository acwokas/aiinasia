-- Create enum for article types
CREATE TYPE public.article_type AS ENUM ('feature', 'news', 'opinion', 'tools', 'life');

-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'contributor', 'user');

-- Authors table
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  email TEXT,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  featured_image_caption TEXT,
  featured_image_credit TEXT,
  article_type article_type NOT NULL DEFAULT 'news',
  status article_status NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  primary_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  focus_keyphrase TEXT,
  canonical_url TEXT,
  
  -- Editorial fields
  featured_on_homepage BOOLEAN DEFAULT FALSE,
  sticky BOOLEAN DEFAULT FALSE,
  cornerstone BOOLEAN DEFAULT FALSE,
  reading_time_minutes INTEGER,
  
  -- AI-generated fields (cached)
  ai_summary TEXT,
  ai_tags TEXT[],
  ai_generated_at TIMESTAMPTZ,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Temporal context
  event_date DATE,
  event_location TEXT,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Version control
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Article-Category junction (many-to-many)
CREATE TABLE public.article_categories (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- Article-Tag junction (many-to-many)
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- RLS Policies for authors
CREATE POLICY "Authors viewable by everyone"
  ON public.authors FOR SELECT
  USING (TRUE);

CREATE POLICY "Authors manageable by admins and editors"
  ON public.authors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS Policies for categories
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Categories manageable by admins"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tags
CREATE POLICY "Tags viewable by everyone"
  ON public.tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Tags manageable by admins and editors"
  ON public.tags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS Policies for articles
CREATE POLICY "Published articles viewable by everyone"
  ON public.articles FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Articles manageable by admins and editors"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'contributor'));

CREATE POLICY "Articles updatable by admins and editors"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor') OR (public.has_role(auth.uid(), 'contributor') AND created_by = auth.uid()));

CREATE POLICY "Articles deletable by admins"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for article_categories
CREATE POLICY "Article categories viewable by everyone"
  ON public.article_categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Article categories manageable by admins and editors"
  ON public.article_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS Policies for article_tags
CREATE POLICY "Article tags viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Article tags manageable by admins and editors"
  ON public.article_tags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- RLS Policies for user_roles
CREATE POLICY "User roles viewable by admins"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "User roles manageable by admins only"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Newsletter subscribers manageable by admins"
  ON public.newsletter_subscribers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Newsletter signup by anyone"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for comments
CREATE POLICY "Approved comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (approved = TRUE OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Comments manageable by admins and editors"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Comments deletable by admins"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_author_id ON public.articles(author_id);
CREATE INDEX idx_articles_featured ON public.articles(featured_on_homepage) WHERE featured_on_homepage = TRUE;
CREATE INDEX idx_authors_slug ON public.authors(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_approved ON public.comments(approved) WHERE approved = TRUE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Features', 'features', 'In-depth analysis and feature stories', 1),
  ('News', 'news', 'Latest AI news from Asia', 2),
  ('Opinion', 'opinion', 'Expert opinions and commentary', 3),
  ('Tools', 'tools', 'AI tools and platform reviews', 4),
  ('Events', 'events', 'Conferences, workshops and AI events', 5);

-- Insert some common tags
INSERT INTO public.tags (name, slug) VALUES
  ('Machine Learning', 'machine-learning'),
  ('Natural Language Processing', 'natural-language-processing'),
  ('Computer Vision', 'computer-vision'),
  ('Robotics', 'robotics'),
  ('AI Ethics', 'ai-ethics'),
  ('Startups', 'startups'),
  ('Research', 'research'),
  ('Enterprise AI', 'enterprise-ai');