-- Create migration tracking tables
CREATE TABLE IF NOT EXISTS public.migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  batch_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_records INTEGER,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_details JSONB,
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.url_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  old_url TEXT NOT NULL UNIQUE,
  new_url TEXT NOT NULL,
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  redirect_created BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.migration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for migration_logs (admin only)
CREATE POLICY "Admins can view migration logs"
  ON public.migration_logs
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert migration logs"
  ON public.migration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update migration logs"
  ON public.migration_logs
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for url_mappings (admin only)
CREATE POLICY "Admins can view url mappings"
  ON public.url_mappings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert url mappings"
  ON public.url_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update url mappings"
  ON public.url_mappings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_migration_logs_batch_id ON public.migration_logs(batch_id);
CREATE INDEX idx_migration_logs_status ON public.migration_logs(status);
CREATE INDEX idx_url_mappings_old_slug ON public.url_mappings(old_slug);
CREATE INDEX idx_url_mappings_article_id ON public.url_mappings(article_id);