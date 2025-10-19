-- Step 1: Create new article_type enum with template-based types
CREATE TYPE article_type_new AS ENUM ('article', 'voice', 'guide', 'tool', 'video', 'site_furniture');

-- Step 2: Add temporary column with new type
ALTER TABLE public.articles ADD COLUMN article_type_temp article_type_new;

-- Step 3: Migrate all existing articles to 'article' type
UPDATE public.articles SET article_type_temp = 'article';

-- Step 4: Drop old column and rename new column
ALTER TABLE public.articles DROP COLUMN article_type;
ALTER TABLE public.articles RENAME COLUMN article_type_temp TO article_type;

-- Step 5: Set default and not null constraint
ALTER TABLE public.articles ALTER COLUMN article_type SET DEFAULT 'article'::article_type_new;
ALTER TABLE public.articles ALTER COLUMN article_type SET NOT NULL;

-- Step 6: Drop old enum type (after column is removed)
DROP TYPE IF EXISTS article_type_old CASCADE;