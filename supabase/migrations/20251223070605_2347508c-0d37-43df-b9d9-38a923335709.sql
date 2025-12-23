CREATE OR REPLACE FUNCTION public.increment_singles_stats(p_player_name text, p_points numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate player name
  IF char_length(TRIM(p_player_name)) < 2 OR char_length(p_player_name) > 50 THEN
    RAISE EXCEPTION 'Invalid player name length';
  END IF;
  
  IF TRIM(p_player_name) = '' THEN
    RAISE EXCEPTION 'Player name cannot be empty';
  END IF;
  
  -- Validate points (reasonable range for a game)
  IF p_points < 0 OR p_points > 10 THEN
    RAISE EXCEPTION 'Invalid points value: must be between 0 and 10';
  END IF;
  
  -- Verify player exists
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE name = p_player_name) THEN
    RAISE EXCEPTION 'Player does not exist';
  END IF;

  -- Update BOTH singles AND doubles stats
  UPDATE public.players
  SET 
    total_points = total_points + p_points,
    games_played = games_played + 1,
    singles_points = singles_points + p_points,
    singles_games = singles_games + 1,
    doubles_points = doubles_points + p_points,
    doubles_games = doubles_games + 1,
    updated_at = now()
  WHERE name = p_player_name;
END;
$function$;