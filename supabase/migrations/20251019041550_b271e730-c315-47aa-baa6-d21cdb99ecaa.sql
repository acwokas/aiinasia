-- Create achievements for signup completion levels
-- Only insert if they don't already exist (using WHERE NOT EXISTS)
INSERT INTO public.achievements (name, description, badge_icon, category, points_required)
SELECT 'Digital Pioneer', 'Complete your first sign up and join the AI in Asia community', '🌟', 'Getting Started', 0
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Digital Pioneer');

INSERT INTO public.achievements (name, description, badge_icon, category, points_required)
SELECT 'Profile Master', 'Complete your profile with all optional information and earn maximum signup points', '👑', 'Getting Started', 0
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Profile Master');