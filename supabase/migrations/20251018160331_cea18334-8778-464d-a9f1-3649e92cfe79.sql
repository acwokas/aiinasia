-- Remove events older than October 1, 2025
DELETE FROM public.events
WHERE start_date < '2025-10-01';