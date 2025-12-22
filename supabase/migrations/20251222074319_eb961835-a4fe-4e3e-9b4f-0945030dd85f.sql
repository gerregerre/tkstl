-- Add doubles tracking columns to players table
ALTER TABLE public.players 
ADD COLUMN doubles_points NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN doubles_games INTEGER NOT NULL DEFAULT 0;

-- Copy existing stats to doubles (since all current games are doubles/team games)
UPDATE public.players SET 
  doubles_points = total_points,
  doubles_games = games_played;