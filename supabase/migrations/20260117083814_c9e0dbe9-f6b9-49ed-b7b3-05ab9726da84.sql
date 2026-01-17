CREATE OR REPLACE FUNCTION public.recalculate_player_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game RECORD;
  player_points_a NUMERIC;
  player_points_b NUMERIC;
  total_score INTEGER;
BEGIN
  -- Reset all player stats
  UPDATE public.players SET 
    total_points = 0,
    games_played = 0,
    singles_points = 0,
    singles_games = 0,
    doubles_points = 0,
    doubles_games = 0
  WHERE true;

  -- Reset all team stats
  UPDATE public.team_stats SET 
    total_points = 0,
    games_played = 0
  WHERE true;

  -- Loop through all games with a winner
  FOR game IN 
    SELECT * FROM public.session_games WHERE winner IS NOT NULL
  LOOP
    -- Calculate total score for the game
    total_score := COALESCE(game.team_a_score, 0) + COALESCE(game.team_b_score, 0);
    
    -- Handle scored games (games 1 & 2) - RAW SCORE as points
    IF total_score > 0 THEN
      -- Team A points = their raw score
      player_points_a := COALESCE(game.team_a_score, 0)::NUMERIC;
      player_points_b := COALESCE(game.team_b_score, 0)::NUMERIC;
    ELSE
      -- Game 3 (Tug of War): Winner gets 10, loser gets 5
      IF game.winner = 'A' THEN
        player_points_a := 10;
        player_points_b := 5;
      ELSE
        player_points_a := 5;
        player_points_b := 10;
      END IF;
    END IF;

    -- Store RAW points - average calculated as total_points / games_played
    -- Update Team A players
    INSERT INTO public.players (name, total_points, games_played, doubles_points, doubles_games)
    VALUES (game.team_a_player1, player_points_a, 1, player_points_a, 1)
    ON CONFLICT (name) DO UPDATE SET
      total_points = players.total_points + EXCLUDED.total_points,
      games_played = players.games_played + 1,
      doubles_points = players.doubles_points + EXCLUDED.doubles_points,
      doubles_games = players.doubles_games + 1,
      updated_at = now();

    INSERT INTO public.players (name, total_points, games_played, doubles_points, doubles_games)
    VALUES (game.team_a_player2, player_points_a, 1, player_points_a, 1)
    ON CONFLICT (name) DO UPDATE SET
      total_points = players.total_points + EXCLUDED.total_points,
      games_played = players.games_played + 1,
      doubles_points = players.doubles_points + EXCLUDED.doubles_points,
      doubles_games = players.doubles_games + 1,
      updated_at = now();

    -- Update Team B players
    INSERT INTO public.players (name, total_points, games_played, doubles_points, doubles_games)
    VALUES (game.team_b_player1, player_points_b, 1, player_points_b, 1)
    ON CONFLICT (name) DO UPDATE SET
      total_points = players.total_points + EXCLUDED.total_points,
      games_played = players.games_played + 1,
      doubles_points = players.doubles_points + EXCLUDED.doubles_points,
      doubles_games = players.doubles_games + 1,
      updated_at = now();

    INSERT INTO public.players (name, total_points, games_played, doubles_points, doubles_games)
    VALUES (game.team_b_player2, player_points_b, 1, player_points_b, 1)
    ON CONFLICT (name) DO UPDATE SET
      total_points = players.total_points + EXCLUDED.total_points,
      games_played = players.games_played + 1,
      doubles_points = players.doubles_points + EXCLUDED.doubles_points,
      doubles_games = players.doubles_games + 1,
      updated_at = now();

    -- Update team stats with raw points
    PERFORM public.increment_team_stats(game.team_a_player1, game.team_a_player2, player_points_a::INTEGER);
    PERFORM public.increment_team_stats(game.team_b_player1, game.team_b_player2, player_points_b::INTEGER);
  END LOOP;
END;
$$;