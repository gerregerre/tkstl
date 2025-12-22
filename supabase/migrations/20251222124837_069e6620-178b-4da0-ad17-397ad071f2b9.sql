-- Create validation function for players table
CREATE OR REPLACE FUNCTION public.validate_player_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length (2-50 characters)
  IF char_length(TRIM(NEW.name)) < 2 THEN
    RAISE EXCEPTION 'Player name must be at least 2 characters';
  END IF;
  
  IF char_length(NEW.name) > 50 THEN
    RAISE EXCEPTION 'Player name must be 50 characters or less';
  END IF;
  
  -- Validate name is not just whitespace
  IF TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'Player name cannot be empty or whitespace only';
  END IF;
  
  -- Validate points are non-negative
  IF NEW.total_points < 0 OR NEW.doubles_points < 0 OR NEW.singles_points < 0 THEN
    RAISE EXCEPTION 'Points cannot be negative';
  END IF;
  
  -- Validate games are non-negative
  IF NEW.games_played < 0 OR NEW.doubles_games < 0 OR NEW.singles_games < 0 THEN
    RAISE EXCEPTION 'Games played cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for players validation
CREATE TRIGGER validate_player_before_insert_update
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_player_data();

-- Create validation function for session_games table
CREATE OR REPLACE FUNCTION public.validate_session_game_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate game_number (1-3)
  IF NEW.game_number < 1 OR NEW.game_number > 3 THEN
    RAISE EXCEPTION 'Game number must be between 1 and 3';
  END IF;
  
  -- Validate scores (0-9) if provided
  IF NEW.team_a_score IS NOT NULL AND (NEW.team_a_score < 0 OR NEW.team_a_score > 9) THEN
    RAISE EXCEPTION 'Team A score must be between 0 and 9';
  END IF;
  
  IF NEW.team_b_score IS NOT NULL AND (NEW.team_b_score < 0 OR NEW.team_b_score > 9) THEN
    RAISE EXCEPTION 'Team B score must be between 0 and 9';
  END IF;
  
  -- Validate player names length (2-50 characters)
  IF char_length(TRIM(NEW.team_a_player1)) < 2 OR char_length(NEW.team_a_player1) > 50 THEN
    RAISE EXCEPTION 'Team A player 1 name must be between 2 and 50 characters';
  END IF;
  
  IF char_length(TRIM(NEW.team_a_player2)) < 2 OR char_length(NEW.team_a_player2) > 50 THEN
    RAISE EXCEPTION 'Team A player 2 name must be between 2 and 50 characters';
  END IF;
  
  IF char_length(TRIM(NEW.team_b_player1)) < 2 OR char_length(NEW.team_b_player1) > 50 THEN
    RAISE EXCEPTION 'Team B player 1 name must be between 2 and 50 characters';
  END IF;
  
  IF char_length(TRIM(NEW.team_b_player2)) < 2 OR char_length(NEW.team_b_player2) > 50 THEN
    RAISE EXCEPTION 'Team B player 2 name must be between 2 and 50 characters';
  END IF;
  
  -- Validate player names are not just whitespace
  IF TRIM(NEW.team_a_player1) = '' OR TRIM(NEW.team_a_player2) = '' OR 
     TRIM(NEW.team_b_player1) = '' OR TRIM(NEW.team_b_player2) = '' THEN
    RAISE EXCEPTION 'Player names cannot be empty or whitespace only';
  END IF;
  
  -- Validate winner if provided
  IF NEW.winner IS NOT NULL AND NEW.winner NOT IN ('A', 'B') THEN
    RAISE EXCEPTION 'Winner must be either A or B';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for session_games validation
CREATE TRIGGER validate_session_game_before_insert_update
  BEFORE INSERT OR UPDATE ON public.session_games
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_game_data();

-- Create validation function for match_results table
CREATE OR REPLACE FUNCTION public.validate_match_result_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate player names length (2-50 characters)
  IF char_length(TRIM(NEW.player1_name)) < 2 OR char_length(NEW.player1_name) > 50 THEN
    RAISE EXCEPTION 'Player 1 name must be between 2 and 50 characters';
  END IF;
  
  IF char_length(TRIM(NEW.player2_name)) < 2 OR char_length(NEW.player2_name) > 50 THEN
    RAISE EXCEPTION 'Player 2 name must be between 2 and 50 characters';
  END IF;
  
  -- Validate player names are not just whitespace
  IF TRIM(NEW.player1_name) = '' OR TRIM(NEW.player2_name) = '' THEN
    RAISE EXCEPTION 'Player names cannot be empty or whitespace only';
  END IF;
  
  -- Validate scores are non-negative
  IF NEW.player1_score < 0 OR NEW.player2_score < 0 THEN
    RAISE EXCEPTION 'Scores cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for match_results validation
CREATE TRIGGER validate_match_result_before_insert_update
  BEFORE INSERT OR UPDATE ON public.match_results
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_match_result_data();

-- Update increment_singles_stats function with validation
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

-- Update increment_team_stats function with validation
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
  -- Validate player names
  IF char_length(TRIM(p_player1)) < 2 OR char_length(p_player1) > 50 THEN
    RAISE EXCEPTION 'Invalid player 1 name length';
  END IF;
  
  IF char_length(TRIM(p_player2)) < 2 OR char_length(p_player2) > 50 THEN
    RAISE EXCEPTION 'Invalid player 2 name length';
  END IF;
  
  IF TRIM(p_player1) = '' OR TRIM(p_player2) = '' THEN
    RAISE EXCEPTION 'Player names cannot be empty';
  END IF;
  
  -- Validate points
  IF p_points < 0 OR p_points > 10 THEN
    RAISE EXCEPTION 'Invalid points value: must be between 0 and 10';
  END IF;

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

-- Update increment_player_stats function with validation
CREATE OR REPLACE FUNCTION public.increment_player_stats(p_player_name text, p_points numeric, p_doubles_points numeric, p_singles_points numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate player name
  IF char_length(TRIM(p_player_name)) < 2 OR char_length(p_player_name) > 50 THEN
    RAISE EXCEPTION 'Invalid player name length';
  END IF;
  
  IF TRIM(p_player_name) = '' THEN
    RAISE EXCEPTION 'Player name cannot be empty';
  END IF;
  
  -- Validate points
  IF p_points < 0 OR p_doubles_points < 0 OR p_singles_points < 0 THEN
    RAISE EXCEPTION 'Points cannot be negative';
  END IF;

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
$function$;