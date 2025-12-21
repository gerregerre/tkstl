-- Create match_results table for storing game results
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_type TEXT NOT NULL DEFAULT 'Singles',
  match_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view match results)
CREATE POLICY "Anyone can view match results" 
ON public.match_results 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert match results
CREATE POLICY "Authenticated users can insert match results" 
ON public.match_results 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for match_results table
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_results;