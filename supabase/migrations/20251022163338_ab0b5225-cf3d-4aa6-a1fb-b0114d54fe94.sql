-- Phase 1: Newsletter System Database Foundation

-- Create enum for newsletter edition status
CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'sent');

-- Create enum for tool/prompt category
CREATE TYPE tool_prompt_category AS ENUM ('tool', 'prompt');

-- 1. Newsletter Editions Table
CREATE TABLE public.newsletter_editions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_date DATE NOT NULL UNIQUE,
  status newsletter_status NOT NULL DEFAULT 'draft',
  subject_line TEXT NOT NULL,
  subject_line_variant_b TEXT,
  scheduled_send_time TIMESTAMP WITH TIME ZONE,
  send_timezone TEXT NOT NULL DEFAULT 'Asia/Singapore',
  
  -- Hero article tracking
  hero_article_id UUID REFERENCES public.articles(id),
  hero_article_manual_override BOOLEAN DEFAULT false,
  hero_article_original UUID REFERENCES public.articles(id),
  
  -- Manual content sections
  editor_note TEXT,
  mini_case_study TEXT,
  meme_image_url TEXT,
  meme_caption TEXT,
  meme_alt_text TEXT,
  
  -- Manual overrides
  comments_count_override INTEGER,
  
  -- Send statistics
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Newsletter Top Stories (junction table)
CREATE TABLE public.newsletter_top_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID NOT NULL REFERENCES public.newsletter_editions(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 5),
  manual_override BOOLEAN DEFAULT false,
  original_article_id UUID REFERENCES public.articles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Newsletter Tools & Prompts
CREATE TABLE public.newsletter_tools_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category tool_prompt_category NOT NULL,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'PromptandGo',
  featured_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Newsletter Quick Takes
CREATE TABLE public.newsletter_quick_takes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.newsletter_editions(id) ON DELETE SET NULL,
  headline TEXT NOT NULL,
  insight TEXT NOT NULL,
  source_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  manually_selected BOOLEAN DEFAULT false,
  display_order INTEGER CHECK (display_order BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Newsletter News Sources
CREATE TABLE public.newsletter_news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  rss_feed_url TEXT,
  region TEXT DEFAULT 'APAC',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Newsletter Mystery Links
CREATE TABLE public.newsletter_mystery_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '60 days'),
  used_in_editions UUID[] DEFAULT ARRAY[]::UUID[],
  is_active BOOLEAN DEFAULT true
);

-- 7. Newsletter Fun Facts
CREATE TABLE public.newsletter_fun_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_text TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Newsletter Sponsors
CREATE TABLE public.newsletter_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  banner_image_url TEXT,
  website_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Learn More',
  is_collective_site BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Newsletter Sends (tracking individual sends)
CREATE TABLE public.newsletter_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID NOT NULL REFERENCES public.newsletter_editions(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  variant TEXT CHECK (variant IN ('A', 'B', 'winner')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  clicked_sections JSONB DEFAULT '[]'::jsonb,
  bounced BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 10. Update newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_opens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_newsletter_editions_date ON public.newsletter_editions(edition_date DESC);
CREATE INDEX idx_newsletter_editions_status ON public.newsletter_editions(status);
CREATE INDEX idx_newsletter_top_stories_edition ON public.newsletter_top_stories(edition_id);
CREATE INDEX idx_newsletter_sends_edition ON public.newsletter_sends(edition_id);
CREATE INDEX idx_newsletter_sends_subscriber ON public.newsletter_sends(subscriber_id);
CREATE INDEX idx_newsletter_mystery_links_active ON public.newsletter_mystery_links(is_active, expires_at);
CREATE INDEX idx_newsletter_quick_takes_edition ON public.newsletter_quick_takes(edition_id);

-- Enable RLS
ALTER TABLE public.newsletter_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_top_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_tools_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_quick_takes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_mystery_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_fun_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_editions
CREATE POLICY "Admins can manage newsletter editions"
  ON public.newsletter_editions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view sent newsletters"
  ON public.newsletter_editions FOR SELECT
  USING (status = 'sent');

-- RLS Policies for newsletter_top_stories
CREATE POLICY "Admins can manage top stories"
  ON public.newsletter_top_stories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view top stories of sent newsletters"
  ON public.newsletter_top_stories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.newsletter_editions 
    WHERE id = edition_id AND status = 'sent'
  ));

-- RLS Policies for newsletter_tools_prompts
CREATE POLICY "Admins can manage tools and prompts"
  ON public.newsletter_tools_prompts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view active tools and prompts"
  ON public.newsletter_tools_prompts FOR SELECT
  USING (is_active = true);

-- RLS Policies for newsletter_quick_takes
CREATE POLICY "Admins can manage quick takes"
  ON public.newsletter_quick_takes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view quick takes of sent newsletters"
  ON public.newsletter_quick_takes FOR SELECT
  USING (edition_id IS NULL OR EXISTS (
    SELECT 1 FROM public.newsletter_editions 
    WHERE id = edition_id AND status = 'sent'
  ));

-- RLS Policies for newsletter_news_sources
CREATE POLICY "Admins can manage news sources"
  ON public.newsletter_news_sources FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS Policies for newsletter_mystery_links
CREATE POLICY "Admins can manage mystery links"
  ON public.newsletter_mystery_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS Policies for newsletter_fun_facts
CREATE POLICY "Admins can manage fun facts"
  ON public.newsletter_fun_facts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view active fun facts"
  ON public.newsletter_fun_facts FOR SELECT
  USING (is_active = true);

-- RLS Policies for newsletter_sponsors
CREATE POLICY "Admins can manage sponsors"
  ON public.newsletter_sponsors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Public can view active sponsors"
  ON public.newsletter_sponsors FOR SELECT
  USING (is_active = true);

-- RLS Policies for newsletter_sends
CREATE POLICY "Admins can view all sends"
  ON public.newsletter_sends FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "System can insert sends"
  ON public.newsletter_sends FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sends"
  ON public.newsletter_sends FOR UPDATE
  USING (true);

-- Trigger for updated_at timestamps
CREATE TRIGGER update_newsletter_editions_updated_at
  BEFORE UPDATE ON public.newsletter_editions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_tools_prompts_updated_at
  BEFORE UPDATE ON public.newsletter_tools_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_sponsors_updated_at
  BEFORE UPDATE ON public.newsletter_sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial news sources
INSERT INTO public.newsletter_news_sources (name, url, region, is_active) VALUES
  ('Tech in Asia', 'https://www.techinasia.com', 'APAC', true),
  ('KrAsia', 'https://kr-asia.com', 'APAC', true),
  ('e27', 'https://e27.co', 'APAC', true),
  ('TechNode', 'https://technode.com', 'APAC', true),
  ('Vulcan Post', 'https://vulcanpost.com', 'APAC', true),
  ('DealStreetAsia', 'https://www.dealstreetasia.com', 'APAC', true),
  ('The Ken', 'https://the-ken.com', 'APAC', true);

-- Seed initial fun facts
INSERT INTO public.newsletter_fun_facts (fact_text, source, is_active) VALUES
  ('The term "Artificial Intelligence" was coined in 1956 by John McCarthy at the Dartmouth Conference.', 'Historical Records', true),
  ('GPT-3 has 175 billion parameters, making it one of the largest language models ever created.', 'OpenAI', true),
  ('China produces more AI research papers than any other country, accounting for nearly 30% of global AI publications.', 'AI Index Report 2023', true),
  ('Singapore aims to invest S$1 billion in AI over the next 5 years through its National AI Strategy.', 'Singapore Government', true),
  ('AI can now detect diabetic retinopathy from eye scans with accuracy matching or exceeding human specialists.', 'Medical AI Research', true),
  ('The global AI market in Asia-Pacific is expected to reach $190 billion by 2025.', 'Market Research', true),
  ('Japan has more industrial robots per capita than any other nation in the world.', 'International Federation of Robotics', true),
  ('India is expected to contribute $957 billion to its economy through AI by 2035.', 'Accenture Report', true);

-- Seed initial You.WithThePowerOf.AI collective sponsors
INSERT INTO public.newsletter_sponsors (name, logo_url, banner_image_url, website_url, cta_text, is_collective_site, is_active, priority) VALUES
  ('Business in a Byte', '/businessinabyte-logo.png', '/businessinabyte-banner.jpg', 'https://businessinabyte.com', 'Read More Business Insights', true, true, 1),
  ('Prompt and Go', '/promptandgo-logo.png', '/promptandgo-banner.jpg', 'https://promptandgo.com', 'Explore AI Prompts', true, true, 2),
  ('AI Academy', '/aiacademy-logo.png', '/aiacademy-banner.jpg', 'https://aiacademy.ai', 'Start Learning AI', true, true, 3),
  ('My Offer Club', '/myofferclub-logo.png', '/myofferclub-banner.jpg', 'https://myofferclub.com', 'Discover Exclusive Offers', true, true, 4);