-- Create news_items table
CREATE TABLE public.news_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'update' CHECK (type IN ('update', 'announcement', 'result', 'feature')),
  date_label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view active news items
CREATE POLICY "Anyone can view active news items"
ON public.news_items
FOR SELECT
USING (is_active = true);

-- Authenticated users can manage news items
CREATE POLICY "Authenticated users can insert news items"
ON public.news_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update news items"
ON public.news_items
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete news items"
ON public.news_items
FOR DELETE
TO authenticated
USING (true);

-- Insert initial news items
INSERT INTO public.news_items (title, description, type, date_label) VALUES
('Session History Now Available', 'Track all your past games with our new session history feature. View scores, teams, and match details.', 'feature', 'Dec 2024'),
('Edit & Delete Games', 'Made a scoring mistake? You can now edit or delete recorded session games directly from the history.', 'update', 'Dec 2024'),
('New Leaderboard Design', 'Check out the refreshed leaderboard with improved player cards and real-time stat updates.', 'feature', 'Nov 2024'),
('Head-to-Head Stats', 'Compare your performance against any player with our new head-to-head statistics feature.', 'feature', 'Nov 2024'),
('Welcome to TKSTL', 'The official digital home of Tennisklubben Stora Tennisligan. Track scores, compete, and rise through the ranks!', 'announcement', 'Est. 2017');