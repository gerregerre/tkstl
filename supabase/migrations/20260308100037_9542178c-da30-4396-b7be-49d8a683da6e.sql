
-- Seasons table
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  champion_singles text,
  champion_doubles text,
  total_sessions integer DEFAULT 0,
  total_games integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Season standings (archived final rankings)
CREATE TABLE public.season_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'singles',
  rank integer NOT NULL,
  avg_points numeric NOT NULL DEFAULT 0,
  win_percentage numeric NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  is_champion boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_standings ENABLE ROW LEVEL SECURITY;

-- Everyone can view seasons and standings
CREATE POLICY "Anyone can view seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage seasons" ON public.seasons FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can view season standings" ON public.season_standings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage standings" ON public.season_standings FOR ALL TO authenticated USING (true) WITH CHECK (true);
