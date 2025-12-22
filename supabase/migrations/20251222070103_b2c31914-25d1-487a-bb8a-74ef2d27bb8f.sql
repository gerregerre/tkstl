-- Add UPDATE policy for session_games
CREATE POLICY "Authenticated users can update session games"
ON public.session_games
FOR UPDATE
USING (true);

-- Add DELETE policy for session_games
CREATE POLICY "Authenticated users can delete session games"
ON public.session_games
FOR DELETE
USING (true);