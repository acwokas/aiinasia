-- Add real AI conferences from verified sources (no duplicates)
INSERT INTO public.events (title, slug, description, event_type, start_date, end_date, location, city, country, region, website_url, is_featured, organizer, status) VALUES

-- October 2025
('AI Revolution Summit Philippines 2025', 'ai-revolution-summit-philippines-2025', 'Exclusive in-person gathering of C-level executives and policymakers exploring AI''s transformative impact across government, finance, healthcare, and retail sectors.', 'summit', '2025-10-17 09:00:00+08', '2025-10-17 18:00:00+08', 'Manila', 'Manila', 'Philippines', 'APAC', 'https://airevolutionsummit.com/philippines/', false, 'AI Revolution Summit', 'upcoming'),

('ROSCon 2025', 'roscon-2025', 'The premier conference for the Robot Operating System (ROS) community, bringing together developers and researchers in robotics and AI.', 'conference', '2025-10-27 08:00:00+08', '2025-10-31 18:00:00+08', 'Suntec Singapore Convention & Exhibition Centre', 'Singapore', 'Singapore', 'APAC', null, false, 'Open Robotics', 'upcoming'),

('GovAI Summit', 'govai-summit-2025', 'Explore the transformative potential of AI in the public sector with insights from keynotes, panel discussions, and real-world government use cases.', 'summit', '2025-10-27 09:00:00-05', '2025-10-29 18:00:00-05', 'Arlington Convention Center', 'Arlington', 'United States', 'North America', 'https://www.govaisummit.com/', false, 'GovAI', 'upcoming'),

-- November 2025
('Ray Summit', 'ray-summit-2025', 'The leading conference for Ray, the open-source framework for scaling AI and Python workloads, featuring talks on distributed computing and ML at scale.', 'conference', '2025-11-03 09:00:00-08', '2025-11-05 18:00:00-08', 'San Francisco', 'San Francisco', 'United States', 'North America', null, true, 'Anyscale', 'upcoming'),

('Future of AI Summit', 'future-ai-summit-london-2025', 'Leading summit exploring the next generation of AI technologies, applications, and their impact on business and society.', 'summit', '2025-11-05 09:00:00+00', '2025-11-06 18:00:00+00', 'London', 'London', 'United Kingdom', 'Europe', null, false, 'Future of AI', 'upcoming'),

('Generative AI Summit London', 'generative-ai-summit-london-2025', 'Focused summit on generative AI applications, featuring the latest in large language models, image generation, and creative AI tools.', 'summit', '2025-11-06 09:00:00+00', '2025-11-06 18:00:00+00', 'London', 'London', 'United Kingdom', 'Europe', null, false, 'Generative AI Summit', 'upcoming'),

('dotAI', 'dotai-2025', 'Premier AI conference in Europe featuring cutting-edge research and practical applications of artificial intelligence.', 'conference', '2025-11-08 09:00:00+01', '2025-11-09 18:00:00+01', 'Paris', 'Paris', 'France', 'Europe', null, true, 'dotConferences', 'upcoming'),

('AI Infra Summit', 'ai-infra-summit-2025', 'Focus on AI infrastructure, MLOps, and the systems powering modern AI applications at scale.', 'summit', '2025-11-09 09:00:00-08', '2025-11-11 18:00:00-08', 'Santa Clara Convention Center', 'Santa Clara', 'United States', 'North America', null, false, 'AI Infrastructure Alliance', 'upcoming'),

('International Conference on Generative AI', 'icgai-osaka-2025', 'Academic and industry conference exploring advances in generative AI models, applications, and ethical considerations.', 'conference', '2025-11-10 09:00:00+09', '2025-11-11 18:00:00+09', 'Osaka International Convention Center', 'Osaka', 'Japan', 'APAC', null, false, 'ICGAI', 'upcoming'),

('Generative AI Week', 'genai-week-austin-2025', 'Week-long event focused on practical applications of generative AI in business, featuring workshops and hands-on sessions.', 'conference', '2025-11-11 09:00:00-06', '2025-11-14 18:00:00-06', 'Austin Convention Center', 'Austin', 'United States', 'North America', null, false, 'GenAI Week', 'upcoming'),

('International Conference on Machine Learning & AI Singapore', 'icml-ai-singapore-2025', 'International conference bringing together ML researchers and AI practitioners to share latest developments in the field.', 'conference', '2025-11-13 09:00:00+08', '2025-11-14 18:00:00+08', 'Singapore', 'Singapore', 'Singapore', 'APAC', null, true, 'ICML&AI', 'upcoming'),

('GovTech Innovation Day 2025', 'govtech-innovation-day-2025', 'Singapore government technology showcase featuring AI innovations in public services and smart nation initiatives.', 'conference', '2025-11-13 09:00:00+08', '2025-11-13 18:00:00+08', 'Sands Expo & Convention Centre', 'Singapore', 'Singapore', 'APAC', null, false, 'GovTech Singapore', 'upcoming'),

('AI By The Bay', 'ai-by-the-bay-2025', 'Premier AI conference in the San Francisco Bay Area featuring technical talks, workshops, and networking for AI practitioners.', 'conference', '2025-11-17 09:00:00-08', '2025-11-19 18:00:00-08', 'Oakland Convention Center', 'Oakland', 'United States', 'North America', null, false, 'BayLearn', 'upcoming'),

-- December 2025
('Global AI Show Abu Dhabi 2025', 'global-ai-show-abu-dhabi-2025', 'Premier AI exhibition themed "AI 2031: Accelerating Intelligent Futures" with 5,000+ attendees, 200+ speakers showcasing innovations that will transform society.', 'conference', '2025-12-08 09:00:00+04', '2025-12-09 18:00:00+04', 'Space42 Arena', 'Abu Dhabi', 'United Arab Emirates', 'Middle East', 'https://www.globalaishow.com/abu-dhabi/', true, 'Global AI Show', 'upcoming'),

('World Summit AI', 'world-summit-ai-doha-2025', 'Global AI summit bringing together leading minds in artificial intelligence for discussions on the future of AI and its applications.', 'summit', '2025-12-09 09:00:00+03', '2025-12-10 18:00:00+03', 'Doha', 'Doha', 'Qatar', 'Middle East', null, true, 'World Summit AI', 'upcoming'),

-- February 2026
('2nd International Conference on AI & Data Science', 'icaids-dubai-2026', 'Academic conference focused on the intersection of artificial intelligence and data science with practical applications.', 'conference', '2026-02-12 09:00:00+04', '2026-02-13 18:00:00+04', 'Dubai', 'Dubai', 'United Arab Emirates', 'Middle East', null, false, 'ICAIDS', 'upcoming'),

-- March 2026
('Chatbot & Conversational AI Summit', 'chatbot-ai-edinburgh-2026', 'Specialized summit on conversational AI, chatbots, and natural language processing with hybrid in-person and virtual attendance.', 'summit', '2026-03-17 09:00:00+00', '2026-03-19 18:00:00+00', 'Edinburgh International Conference Centre', 'Edinburgh', 'United Kingdom', 'Europe', null, false, 'Conversational AI Summit', 'upcoming'),

-- May 2026
('Embedded Vision Summit', 'embedded-vision-summit-2026', 'Leading conference on computer vision and AI in embedded systems, featuring cutting-edge applications in robotics and IoT.', 'summit', '2026-05-19 09:00:00-07', '2026-05-21 18:00:00-07', 'Santa Clara Convention Center', 'Santa Clara', 'United States', 'North America', null, false, 'Embedded Vision Alliance', 'upcoming');