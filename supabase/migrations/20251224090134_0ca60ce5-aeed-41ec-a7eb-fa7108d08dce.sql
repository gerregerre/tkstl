-- Add DELETE policy for team_stats so recalculation can clear old data
CREATE POLICY "Authenticated users can delete team stats" 
ON public.team_stats 
FOR DELETE 
USING (true);