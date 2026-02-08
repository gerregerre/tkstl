-- Allow users to delete their own votes
CREATE POLICY "Users can delete their own vote"
ON public.party_votes
FOR DELETE
USING (auth.uid() = user_id);