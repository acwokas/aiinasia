-- Create table for editor's picks
CREATE TABLE IF NOT EXISTS public.editors_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL, -- 'homepage' or category slug
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(location)
);

-- Enable RLS
ALTER TABLE public.editors_picks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Editor's picks viewable by everyone"
  ON public.editors_picks FOR SELECT
  USING (true);

CREATE POLICY "Editor's picks manageable by admins and editors"
  ON public.editors_picks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_editors_picks_updated_at
  BEFORE UPDATE ON public.editors_picks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();