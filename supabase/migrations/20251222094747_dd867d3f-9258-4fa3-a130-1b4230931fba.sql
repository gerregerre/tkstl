-- Fix RPC functions to require authentication
-- 1. Update increment_singles_stats to require auth
CREATE OR REPLACE FUNCTION public.increment_singles_stats(p_player_name TEXT, p_points NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
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
$$;

-- 2. Update increment_team_stats to require auth
CREATE OR REPLACE FUNCTION public.increment_team_stats(p_player1 TEXT, p_player2 TEXT, p_points NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p1 TEXT;
  v_p2 TEXT;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
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
$$;

-- 3. Update increment_player_stats to require auth
CREATE OR REPLACE FUNCTION public.increment_player_stats(p_player_name TEXT, p_points NUMERIC, p_doubles_points NUMERIC, p_singles_points NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
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
$$;

-- 4. Fix team_stats INSERT policy to require authentication
DROP POLICY IF EXISTS "Anyone can insert team stats" ON public.team_stats;
CREATE POLICY "Authenticated users can insert team stats" 
ON public.team_stats 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 5. Fix session_games INSERT policy to require authentication
DROP POLICY IF EXISTS "Anyone can insert session games" ON public.session_games;
CREATE POLICY "Authenticated users can insert session games" 
ON public.session_games 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 6. Create profiles table for user data with roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('royalty', 'peasant')),
  title TEXT,
  bio TEXT,
  years_of_service INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create function to get user role safely (for RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();