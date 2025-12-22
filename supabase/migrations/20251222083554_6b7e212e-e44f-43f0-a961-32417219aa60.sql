-- Create team_stats table for tracking doubles team combinations
CREATE TABLE public.team_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  total_points NUMERIC NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure player names are stored in consistent order (alphabetically)
  CONSTRAINT team_unique UNIQUE (player1_name, player2_name)
);

-- Enable RLS
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view team stats
CREATE POLICY "Anyone can view team stats" 
ON public.team_stats 
FOR SELECT 
USING (true);

-- Anyone can insert team stats (for session recording)
CREATE POLICY "Anyone can insert team stats" 
ON public.team_stats 
FOR INSERT 
WITH CHECK (true);

-- Authenticated users can update team stats
CREATE POLICY "Authenticated users can update team stats" 
ON public.team_stats 
FOR UPDATE 
USING (true);

-- Create function to increment team stats atomically
CREATE OR REPLACE FUNCTION public.increment_team_stats(
  p_player1 TEXT,
  p_player2 TEXT,
  p_points NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p1 TEXT;
  v_p2 TEXT;
BEGIN
  -- Sort player names alphabetically for consistent team identification
  IF p_player1 < p_player2 THEN
    v_p1 := p_player1;
    v_p2 := p_player2;
  ELSE
    v_p1 := p_player2;
    v_p2 := p_player1;
  END IF;

  -- Insert or update team stats
  INSERT INTO public.team_stats (player1_name, player2_name, total_points, games_played)
  VALUES (v_p1, v_p2, p_points, 1)
  ON CONFLICT (player1_name, player2_name)
  DO UPDATE SET
    total_points = team_stats.total_points + p_points,
    games_played = team_stats.games_played + 1,
    updated_at = now();
END;
$$;

-- Create function to increment only singles stats for a player
CREATE OR REPLACE FUNCTION public.increment_singles_stats(
  p_player_name TEXT,
  p_points NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.players
  SET 
    total_points = total_points + p_points,
    games_played = games_played + 1,
    singles_points = singles_points + p_points,
    singles_games = singles_games + 1,
    updated_at = now()
  WHERE name = p_player_name;
END;
$$;