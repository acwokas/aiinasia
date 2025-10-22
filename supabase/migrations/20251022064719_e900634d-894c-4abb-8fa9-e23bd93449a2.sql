-- Update article titles to change "Adrian's Arena" to "Adrian's Angle"
UPDATE articles 
SET title = REPLACE(title, 'Adrian''s Arena:', 'Adrian''s Angle:')
WHERE title LIKE 'Adrian''s Arena:%';