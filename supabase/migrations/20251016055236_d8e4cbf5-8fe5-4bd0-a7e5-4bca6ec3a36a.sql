-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Create RLS policies for article images
CREATE POLICY "Anyone can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins and editors can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  )
);