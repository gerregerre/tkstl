CREATE OR REPLACE FUNCTION public.recalculate_player_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  game RECORD;
  player_points_a NUMERIC;
  player_points_b NUMERIC;
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
    
    -- Handle scored games (games 1 & 2)
    IF total_score > 0 THEN
      -- Team A points based on score ratio
      player_points_a := (COALESCE(game.team_a_score, 0)::NUMERIC / total_score::NUMERIC) * 10;
      player_points_b := (COALESCE(game.team_b_score, 0)::NUMERIC / total_score::NUMERIC) * 10;
    ELSE
      -- Game 3 (ladder): Winner gets 10, loser gets 5
      IF game.winner = 'A' THEN
        player_points_a := 10;
        player_points_b := 5;
      ELSE
        player_points_a := 5;
        player_points_b := 10;
      END IF;
    END IF;
    
    -- Update Team A Player 1
    UPDATE public.players
    SET 
      total_points = total_points + player_points_a,
      games_played = games_played + 1,
      doubles_points = doubles_points + player_points_a,
      doubles_games = doubles_games + 1,
      singles_points = singles_points + player_points_a,
      singles_games = singles_games + 1,
      updated_at = now()
    WHERE name = game.team_a_player1;
    
    -- Update Team A Player 2
    UPDATE public.players
    SET 
      total_points = total_points + player_points_a,
      games_played = games_played + 1,
      doubles_points = doubles_points + player_points_a,
      doubles_games = doubles_games + 1,
      singles_points = singles_points + player_points_a,
      singles_games = singles_games + 1,
      updated_at = now()
    WHERE name = game.team_a_player2;
    
    -- Update Team B Player 1
    UPDATE public.players
    SET 
      total_points = total_points + player_points_b,
      games_played = games_played + 1,
      doubles_points = doubles_points + player_points_b,
      doubles_games = doubles_games + 1,
      singles_points = singles_points + player_points_b,
      singles_games = singles_games + 1,
      updated_at = now()
    WHERE name = game.team_b_player1;
    
    -- Update Team B Player 2
    UPDATE public.players
    SET 
      total_points = total_points + player_points_b,
      games_played = games_played + 1,
      doubles_points = doubles_points + player_points_b,
      doubles_games = doubles_games + 1,
      singles_points = singles_points + player_points_b,
      singles_games = singles_games + 1,
      updated_at = now()
    WHERE name = game.team_b_player2;
    
    -- Update team stats for Team A
    INSERT INTO public.team_stats (player1_name, player2_name, total_points, games_played)
    VALUES (
      LEAST(game.team_a_player1, game.team_a_player2),
      GREATEST(game.team_a_player1, game.team_a_player2),
      player_points_a,
      1
    )
    ON CONFLICT (player1_name, player2_name)
    DO UPDATE SET
      total_points = team_stats.total_points + player_points_a,
      games_played = team_stats.games_played + 1,
      updated_at = now();
    
    -- Update team stats for Team B
    INSERT INTO public.team_stats (player1_name, player2_name, total_points, games_played)
    VALUES (
      LEAST(game.team_b_player1, game.team_b_player2),
      GREATEST(game.team_b_player1, game.team_b_player2),
      player_points_b,
      1
    )
    ON CONFLICT (player1_name, player2_name)
    DO UPDATE SET
      total_points = team_stats.total_points + player_points_b,
      games_played = team_stats.games_played + 1,
      updated_at = now();
  END LOOP;
END;
$function$;