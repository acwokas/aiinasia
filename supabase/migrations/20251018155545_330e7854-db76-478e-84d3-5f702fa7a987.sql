-- Clear existing seed data and insert realistic upcoming events
DELETE FROM public.events;

-- Insert updated events with future dates
INSERT INTO public.events (title, slug, description, event_type, start_date, end_date, location, city, country, region, website_url, is_featured, organizer, status) VALUES
-- November 2025
('NeurIPS 2025', 'neurips-2025', 'The premier conference for neural information processing systems, featuring cutting-edge research in machine learning and AI.', 'conference', '2025-11-09 09:00:00-08', '2025-11-15 18:00:00-08', 'Vancouver Convention Centre', 'Vancouver', 'Canada', 'North America', 'https://neurips.cc', true, 'NeurIPS Foundation', 'upcoming'),

-- December 2025
('AI Summit Singapore 2025', 'ai-summit-singapore-2025', 'Asia''s largest artificial intelligence conference bringing together industry leaders, researchers, and innovators.', 'conference', '2025-12-10 09:00:00+08', '2025-12-12 18:00:00+08', 'Marina Bay Sands', 'Singapore', 'Singapore', 'APAC', 'https://theaisummit.com/singapore', true, 'TechEx', 'upcoming'),

('Deep Learning Workshop Tokyo', 'deep-learning-tokyo-dec-2025', 'Advanced workshop on transformer architectures and large language models.', 'workshop', '2025-12-18 10:00:00+09', '2025-12-18 17:00:00+09', 'Tokyo International Forum', 'Tokyo', 'Japan', 'APAC', null, false, 'Japan Deep Learning Association', 'upcoming'),

-- January 2026
('AI Hardware Summit', 'ai-hardware-summit-2026', 'Focus on AI chips, GPUs, and specialized hardware for machine learning workloads.', 'summit', '2026-01-15 09:00:00-08', '2026-01-16 18:00:00-08', 'Santa Clara Convention Center', 'Santa Clara', 'United States', 'North America', null, false, 'AI Hardware Association', 'upcoming'),

-- February 2026
('AAAI Conference 2026', 'aaai-2026', 'Association for the Advancement of Artificial Intelligence annual conference.', 'conference', '2026-02-21 09:00:00-05', '2026-02-26 18:00:00-05', 'Philadelphia Convention Center', 'Philadelphia', 'United States', 'North America', 'https://aaai.org/conference', true, 'AAAI', 'upcoming'),

('AI in Healthcare Asia', 'ai-healthcare-asia-2026', 'Exploring AI applications in medical diagnosis, drug discovery, and patient care across Asia.', 'summit', '2026-02-18 09:00:00+05:30', '2026-02-19 17:00:00+05:30', 'Bangalore International Exhibition Centre', 'Bangalore', 'India', 'APAC', null, false, 'HealthTech India', 'upcoming'),

-- March 2026
('AI Ethics Symposium Seoul', 'ai-ethics-seoul-2026', 'Exploring ethical considerations, bias mitigation, and responsible AI development practices.', 'symposium', '2026-03-12 09:00:00+09', '2026-03-13 17:00:00+09', 'COEX Convention Center', 'Seoul', 'South Korea', 'APAC', null, false, 'Korea AI Ethics Institute', 'upcoming'),

('GTC 2026', 'gtc-2026', 'NVIDIA''s GPU Technology Conference showcasing the latest in AI, graphics, and accelerated computing.', 'conference', '2026-03-23 09:00:00-07', '2026-03-26 18:00:00-07', 'San Jose Convention Center', 'San Jose', 'United States', 'North America', 'https://gtc.nvidia.com', true, 'NVIDIA', 'upcoming'),

-- April 2026
('AI World Forum Hong Kong', 'ai-world-forum-hk-2026', 'Premier machine learning and AI conference featuring cutting-edge research and practical applications.', 'conference', '2026-04-08 09:00:00+08', '2026-04-10 18:00:00+08', 'Hong Kong Convention Centre', 'Hong Kong', 'Hong Kong', 'APAC', null, true, 'AI World Forum', 'upcoming'),

-- May 2026
('OpenAI DevDay 2026', 'openai-devday-2026', 'OpenAI''s annual developer conference showcasing the latest in GPT models, DALL-E, and AI tools.', 'conference', '2026-05-14 09:00:00-07', '2026-05-15 18:00:00-07', 'Moscone Center', 'San Francisco', 'United States', 'North America', 'https://devday.openai.com', true, 'OpenAI', 'upcoming'),

('AI for Business ASEAN', 'ai-business-asean-2026', 'Practical strategies for implementing AI solutions in enterprise environments across Southeast Asia.', 'workshop', '2026-05-20 09:00:00+07', '2026-05-21 17:00:00+07', 'Siam Paragon Convention Hall', 'Bangkok', 'Thailand', 'APAC', null, false, 'ASEAN Tech Group', 'upcoming'),

-- June 2026
('CVPR 2026', 'cvpr-2026', 'Computer Vision and Pattern Recognition - the premier conference for computer vision research.', 'conference', '2026-06-14 09:00:00-07', '2026-06-19 18:00:00-07', 'Seattle Convention Center', 'Seattle', 'United States', 'North America', 'https://cvpr.thecvf.com', true, 'CVF', 'upcoming');