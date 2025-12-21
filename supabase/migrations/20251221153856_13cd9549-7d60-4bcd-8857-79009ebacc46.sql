-- Create players table for tracking stats
CREATE TABLE public.players (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    total_points NUMERIC(10,2) NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view players
CREATE POLICY "Anyone can view players"
ON public.players
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update players
CREATE POLICY "Authenticated users can insert players"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update players"
ON public.players
FOR UPDATE
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_players_updated
    BEFORE UPDATE ON public.players
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create session_games table for storing game results with proper scoring
CREATE TABLE public.session_games (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    game_number INTEGER NOT NULL CHECK (game_number BETWEEN 1 AND 3),
    -- Team assignments (player names)
    team_a_player1 TEXT NOT NULL,
    team_a_player2 TEXT NOT NULL,
    team_b_player1 TEXT NOT NULL,
    team_b_player2 TEXT NOT NULL,
    -- Scores (0-9 for games 1 & 2, NULL for game 3)
    team_a_score INTEGER CHECK (team_a_score IS NULL OR (team_a_score >= 0 AND team_a_score <= 9)),
    team_b_score INTEGER CHECK (team_b_score IS NULL OR (team_b_score >= 0 AND team_b_score <= 9)),
    -- For game 3 (ladder): 'A' or 'B'
    winner TEXT CHECK (winner IS NULL OR winner IN ('A', 'B')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_games ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view session games
CREATE POLICY "Anyone can view session games"
ON public.session_games
FOR SELECT
USING (true);

-- Allow authenticated users to insert session games
CREATE POLICY "Authenticated users can insert session games"
ON public.session_games
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_games;

-- Seed the 6 players
INSERT INTO public.players (name) VALUES
    ('Gerard'),
    ('Kockum'),
    ('Viktor'),
    ('Ludvig'),
    ('Joel'),
    ('Hampus');