-- Drop the existing check constraint and add a new one that includes 'breaking'
ALTER TABLE public.news_items DROP CONSTRAINT IF EXISTS news_items_type_check;

ALTER TABLE public.news_items ADD CONSTRAINT news_items_type_check 
CHECK (type IN ('update', 'announcement', 'result', 'feature', 'breaking'));