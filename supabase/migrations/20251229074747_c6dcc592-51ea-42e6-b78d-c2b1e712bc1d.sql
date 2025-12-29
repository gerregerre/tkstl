-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert session games" ON public.session_games;

-- Create a permissive policy that allows anyone to insert session games
CREATE POLICY "Anyone can insert session games"
ON public.session_games
FOR INSERT
TO public
WITH CHECK (true);