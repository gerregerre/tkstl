-- Create a function to atomically increment player stats
CREATE OR REPLACE FUNCTION public.increment_player_stats(
  p_player_name TEXT,
  p_points NUMERIC,
  p_doubles_points NUMERIC,
  p_singles_points NUMERIC
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
    doubles_points = doubles_points + p_doubles_points,
    doubles_games = doubles_games + 1,
    singles_points = singles_points + p_singles_points,
    singles_games = singles_games + 1,
    updated_at = now()
  WHERE name = p_player_name;
END;
$$;