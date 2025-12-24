-- Create a function to recalculate all player stats from session_games
CREATE OR REPLACE FUNCTION public.recalculate_player_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  game RECORD;
  player_name TEXT;
  player_points NUMERIC;
  total_score INTEGER;
BEGIN
  -- Reset all player stats to 0
  UPDATE public.players
  SET 
    total_points = 0,
    games_played = 0,
    doubles_points = 0,
    doubles_games = 0,
    singles_points = 0,
    singles_games = 0,
    updated_at = now();

  -- Clear team stats
  DELETE FROM public.team_stats;

  -- Loop through all session games and recalculate
  FOR game IN SELECT * FROM public.session_games WHERE winner IS NOT NULL
  LOOP
    -- Calculate total score for the game
    total_score := COALESCE(game.team_a_score, 0) + COALESCE(game.team_b_score, 0);
    
    IF total_score > 0 THEN
      -- Team A players
      player_points := (COALESCE(game.team_a_score, 0)::NUMERIC / total_score::NUMERIC) * 10;
      
      -- Update Team A Player 1
      UPDATE public.players
      SET 
        total_points = total_points + player_points,
        games_played = games_played + 1,
        doubles_points = doubles_points + player_points,
        doubles_games = doubles_games + 1,
        singles_points = singles_points + player_points,
        singles_games = singles_games + 1,
        updated_at = now()
      WHERE name = game.team_a_player1;
      
      -- Update Team A Player 2
      UPDATE public.players
      SET 
        total_points = total_points + player_points,
        games_played = games_played + 1,
        doubles_points = doubles_points + player_points,
        doubles_games = doubles_games + 1,
        singles_points = singles_points + player_points,
        singles_games = singles_games + 1,
        updated_at = now()
      WHERE name = game.team_a_player2;
      
      -- Team B players
      player_points := (COALESCE(game.team_b_score, 0)::NUMERIC / total_score::NUMERIC) * 10;
      
      -- Update Team B Player 1
      UPDATE public.players
      SET 
        total_points = total_points + player_points,
        games_played = games_played + 1,
        doubles_points = doubles_points + player_points,
        doubles_games = doubles_games + 1,
        singles_points = singles_points + player_points,
        singles_games = singles_games + 1,
        updated_at = now()
      WHERE name = game.team_b_player1;
      
      -- Update Team B Player 2
      UPDATE public.players
      SET 
        total_points = total_points + player_points,
        games_played = games_played + 1,
        doubles_points = doubles_points + player_points,
        doubles_games = doubles_games + 1,
        singles_points = singles_points + player_points,
        singles_games = singles_games + 1,
        updated_at = now()
      WHERE name = game.team_b_player2;
      
      -- Update team stats for Team A
      PERFORM public.increment_team_stats(game.team_a_player1, game.team_a_player2, 
        (COALESCE(game.team_a_score, 0)::NUMERIC / total_score::NUMERIC) * 10);
      
      -- Update team stats for Team B
      PERFORM public.increment_team_stats(game.team_b_player1, game.team_b_player2,
        (COALESCE(game.team_b_score, 0)::NUMERIC / total_score::NUMERIC) * 10);
    END IF;
  END LOOP;
END;
$function$;