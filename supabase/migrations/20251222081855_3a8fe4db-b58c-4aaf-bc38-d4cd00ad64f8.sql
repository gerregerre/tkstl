-- Drop the restrictive INSERT policy and create a permissive one
DROP POLICY IF EXISTS "Authenticated users can insert session games" ON public.session_games;

CREATE POLICY "Anyone can insert session games" 
ON public.session_games 
FOR INSERT 
WITH CHECK (true);