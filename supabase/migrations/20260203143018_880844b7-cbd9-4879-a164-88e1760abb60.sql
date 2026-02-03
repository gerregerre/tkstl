-- Create party_votes table for end-of-season party voting
CREATE TABLE public.party_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vote_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT party_votes_user_id_unique UNIQUE (user_id),
  CONSTRAINT party_votes_option_check CHECK (vote_option IN ('last_singles', 'last_two_singles', 'last_two_doubles'))
);

-- Enable Row Level Security
ALTER TABLE public.party_votes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view votes (for counting)
CREATE POLICY "Authenticated users can view votes" 
ON public.party_votes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Users can only insert their own vote
CREATE POLICY "Users can insert their own vote" 
ON public.party_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete votes (one vote only)
-- No UPDATE or DELETE policies needed