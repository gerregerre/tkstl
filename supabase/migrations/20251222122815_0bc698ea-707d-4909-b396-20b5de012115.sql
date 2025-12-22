-- Update increment_singles_stats to remove auth requirement
CREATE OR REPLACE FUNCTION public.increment_singles_stats(p_player_name text, p_points numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update increment_team_stats to remove auth requirement
CREATE OR REPLACE FUNCTION public.increment_team_stats(p_player1 text, p_player2 text, p_points numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;