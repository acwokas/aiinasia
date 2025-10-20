-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Published articles viewable by everyone" ON articles;

-- Create updated SELECT policy that allows contributors to view their own drafts
CREATE POLICY "Published articles viewable by everyone"
ON articles
FOR SELECT
TO public
USING (
  status = 'published'
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'editor')
  OR (has_role(auth.uid(), 'contributor') AND created_by = auth.uid())
);