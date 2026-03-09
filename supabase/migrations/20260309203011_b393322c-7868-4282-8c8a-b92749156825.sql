ALTER TABLE public.session_games DROP CONSTRAINT session_games_game_number_check;
ALTER TABLE public.session_games ADD CONSTRAINT session_games_game_number_check CHECK (game_number >= 1);