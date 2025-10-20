-- Update RLS policies to give admins full access to all tables

-- Bookmarks: Allow admins to view/manage all bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;
CREATE POLICY "Users can create own bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Add UPDATE policy for bookmarks
CREATE POLICY "Users can update own bookmarks"
ON bookmarks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Profiles: Allow admins to manage all profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id OR has_role(auth.uid(), 'admin'));

-- Add DELETE policy for profiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Reading history: Allow admins full access
DROP POLICY IF EXISTS "Users can view own reading history" ON reading_history;
CREATE POLICY "Users can view own reading history"
ON reading_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can create own reading history" ON reading_history;
CREATE POLICY "Users can create own reading history"
ON reading_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;
CREATE POLICY "Users can update own reading history"
ON reading_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Add DELETE policy for reading history
CREATE POLICY "Admins can delete reading history"
ON reading_history FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- User stats: Allow admins full access
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats"
ON user_stats FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Add DELETE policy for user stats
CREATE POLICY "Admins can delete user stats"
ON user_stats FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- User achievements: Allow admins full access
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Add UPDATE and DELETE policies for user achievements
CREATE POLICY "Admins can update user achievements"
ON user_achievements FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user achievements"
ON user_achievements FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Scout queries: Allow admins to view all queries
DROP POLICY IF EXISTS "Users can view own queries" ON scout_queries;
CREATE POLICY "Users can view own queries"
ON scout_queries FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert own queries" ON scout_queries;
CREATE POLICY "Users can insert own queries"
ON scout_queries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own queries" ON scout_queries;
CREATE POLICY "Users can update own queries"
ON scout_queries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL OR has_role(auth.uid(), 'admin'));

-- Add DELETE policy for scout queries
CREATE POLICY "Admins can delete scout queries"
ON scout_queries FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Migration logs: Add DELETE policy
CREATE POLICY "Admins can delete migration logs"
ON migration_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- URL mappings: Add DELETE policy
CREATE POLICY "Admins can delete url mappings"
ON url_mappings FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));