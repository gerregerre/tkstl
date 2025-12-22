-- Add singles tracking columns to players table
ALTER TABLE public.players 
ADD COLUMN singles_points NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN singles_games INTEGER NOT NULL DEFAULT 0;