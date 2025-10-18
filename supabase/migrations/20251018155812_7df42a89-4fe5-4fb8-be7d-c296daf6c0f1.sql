-- Clear and update with real, verified AI conferences
DELETE FROM public.events;

-- Insert real upcoming AI conferences with verified dates and locations
INSERT INTO public.events (title, slug, description, event_type, start_date, end_date, location, city, country, region, website_url, is_featured, organizer, status) VALUES

-- November 2025
('Data & AI Summit Singapore 2025', 'data-ai-summit-singapore-2025', 'Bringing data leaders together to explore how AI is redefining business models and unlocking new revenue streams.', 'summit', '2025-11-24 09:00:00+08', '2025-11-24 18:00:00+08', 'Singapore', 'Singapore', 'Singapore', 'APAC', 'https://forefrontevents.co/event/data-ai-summit-singapore-2025/', false, 'Forefront Events', 'upcoming'),

-- December 2025
('NeurIPS 2025', 'neurips-2025', 'The premier conference for neural information processing systems, featuring cutting-edge research in machine learning and AI.', 'conference', '2025-12-02 09:00:00-08', '2025-12-07 18:00:00-08', 'San Diego Convention Center', 'San Diego', 'United States', 'North America', 'https://neurips.cc', true, 'NeurIPS Foundation', 'upcoming'),

-- January 2026
('AAAI 2026', 'aaai-2026', 'The 40th Annual AAAI Conference on Artificial Intelligence promoting theoretical and applied AI research.', 'conference', '2026-01-20 09:00:00+08', '2026-01-27 18:00:00+08', 'Singapore', 'Singapore', 'Singapore', 'APAC', 'https://aaai.org/conference/aaai/aaai-26/', true, 'Association for the Advancement of Artificial Intelligence', 'upcoming'),

-- March 2026
('NVIDIA GTC 2026', 'nvidia-gtc-2026', 'NVIDIA''s GPU Technology Conference at the heart of AI, showcasing the latest in AI, graphics, and accelerated computing.', 'conference', '2026-03-16 09:00:00-07', '2026-03-19 18:00:00-07', 'San Jose Convention Center', 'San Jose', 'United States', 'North America', 'https://www.nvidia.com/gtc/', true, 'NVIDIA', 'upcoming'),

-- May 2026
('The AI Summit Singapore 2026', 'ai-summit-singapore-2026', 'Asia''s leading enterprise AI conference bringing together influential minds, pioneering technologies, and practical insights.', 'conference', '2026-05-20 09:00:00+08', '2026-05-22 18:00:00+08', 'Singapore EXPO', 'Singapore', 'Singapore', 'APAC', 'https://asiatechxsg.com/aisummitsingapore/', true, 'Informa Tech', 'upcoming'),

-- June 2026
('CVPR 2026', 'cvpr-2026', 'The IEEE/CVF Conference on Computer Vision and Pattern Recognition - the premier annual computer vision event.', 'conference', '2026-06-03 09:00:00-06', '2026-06-07 18:00:00-06', 'Denver Convention Center', 'Denver', 'United States', 'North America', 'https://cvpr.thecvf.com/Conferences/2026', true, 'IEEE/CVF', 'upcoming'),

('CVPR 2025', 'cvpr-2025', 'Computer Vision and Pattern Recognition Conference comprising the main conference and several co-located workshops.', 'conference', '2025-06-11 09:00:00-05', '2025-06-15 18:00:00-05', 'Music City Center', 'Nashville', 'United States', 'North America', 'https://cvpr.thecvf.com/Conferences/2025', true, 'IEEE/CVF', 'upcoming'),

-- July 2026
('ICML 2026', 'icml-2026', 'The 43rd International Conference on Machine Learning - the premier gathering of professionals dedicated to machine learning.', 'conference', '2026-07-06 09:00:00+09', '2026-07-12 18:00:00+09', 'COEX Convention & Exhibition Center', 'Seoul', 'South Korea', 'APAC', 'https://icml.cc/Conferences/2026', true, 'ICML', 'upcoming'),

('ICML 2025', 'icml-2025', 'The 42nd International Conference on Machine Learning featuring tutorials, workshops, and cutting-edge research presentations.', 'conference', '2025-07-13 09:00:00-07', '2025-07-19 18:00:00-07', 'Vancouver Convention Center', 'Vancouver', 'Canada', 'North America', 'https://icml.cc/Conferences/2025', true, 'ICML', 'upcoming');