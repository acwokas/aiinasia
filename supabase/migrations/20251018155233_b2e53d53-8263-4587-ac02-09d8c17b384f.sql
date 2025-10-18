-- Create events table for AI conferences and events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'conference',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  venue TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'APAC',
  website_url TEXT,
  registration_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  organizer TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events viewable by everyone"
  ON public.events
  FOR SELECT
  USING (true);

CREATE POLICY "Events manageable by admins and editors"
  ON public.events
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Create index for performance
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_region ON public.events(region);
CREATE INDEX idx_events_status ON public.events(status);

-- Create trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Insert some seed data for AI conferences
INSERT INTO public.events (title, slug, description, event_type, start_date, end_date, location, city, country, region, website_url, is_featured, organizer, status) VALUES
('AI Summit Asia 2025', 'ai-summit-asia-2025', 'Asia''s largest artificial intelligence conference bringing together industry leaders, researchers, and innovators.', 'conference', '2025-03-15 09:00:00+08', '2025-03-17 18:00:00+08', 'Marina Bay Sands Convention Centre', 'Singapore', 'Singapore', 'APAC', 'https://aisummit.asia', true, 'Tech Events Asia', 'upcoming'),
('Neural Networks Workshop', 'neural-networks-workshop', 'Hands-on workshop covering the latest in neural network architectures and training techniques.', 'workshop', '2025-03-22 14:00:00+08', '2025-03-22 17:00:00+08', 'Virtual Event', 'Virtual', 'Global', 'Global', 'https://neuralworkshop.ai', false, 'AI Academy', 'upcoming'),
('Ethics in AI Symposium', 'ethics-ai-symposium-2025', 'Exploring ethical considerations, bias mitigation, and responsible AI development practices.', 'symposium', '2025-04-05 09:00:00+09', '2025-04-06 17:00:00+09', 'Tokyo International Forum', 'Tokyo', 'Japan', 'APAC', 'https://ethicsai.jp', true, 'Japan AI Ethics Institute', 'upcoming'),
('OpenAI DevDay', 'openai-devday-2025', 'OpenAI''s annual developer conference showcasing the latest in GPT models and AI tools.', 'conference', '2025-05-10 09:00:00-07', '2025-05-10 18:00:00-07', 'Moscone Center', 'San Francisco', 'United States', 'North America', 'https://devday.openai.com', true, 'OpenAI', 'upcoming'),
('Machine Learning Asia', 'ml-asia-2025', 'Premier machine learning conference featuring cutting-edge research and practical applications.', 'conference', '2025-06-12 09:00:00+08', '2025-06-14 18:00:00+08', 'Hong Kong Convention Centre', 'Hong Kong', 'Hong Kong', 'APAC', 'https://mlasia.com', true, 'ML Conferences Ltd', 'upcoming'),
('AI in Healthcare Summit', 'ai-healthcare-summit-2025', 'Exploring AI applications in medical diagnosis, drug discovery, and patient care.', 'summit', '2025-07-08 09:00:00+05:30', '2025-07-09 17:00:00+05:30', 'Bangalore International Exhibition Centre', 'Bangalore', 'India', 'APAC', 'https://aihealthcare.in', false, 'HealthTech India', 'upcoming'),
('Deep Learning Summit Seoul', 'deep-learning-seoul-2025', 'Advanced deep learning techniques and applications in computer vision and NLP.', 'summit', '2025-08-20 09:00:00+09', '2025-08-21 18:00:00+09', 'COEX Convention Center', 'Seoul', 'South Korea', 'APAC', 'https://dlsummit.kr', true, 'Korea AI Association', 'upcoming'),
('AI for Business Workshop', 'ai-business-workshop-2025', 'Practical strategies for implementing AI solutions in enterprise environments.', 'workshop', '2025-09-15 13:00:00+07', '2025-09-15 17:00:00+07', 'Siam Paragon Convention Hall', 'Bangkok', 'Thailand', 'APAC', 'https://aibusiness.th', false, 'ASEAN Tech Group', 'upcoming');