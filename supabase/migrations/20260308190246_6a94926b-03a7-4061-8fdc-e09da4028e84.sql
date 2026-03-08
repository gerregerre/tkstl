CREATE OR REPLACE FUNCTION public.validate_session_game_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate game_number (1 or more)
  IF NEW.game_number < 1 THEN
    RAISE EXCEPTION 'Game number must be at least 1';
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
$function$;