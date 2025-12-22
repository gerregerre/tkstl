-- Create messages table for the message board
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all messages
CREATE POLICY "Authenticated users can view messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

-- Users can only create messages for themselves
CREATE POLICY "Users can create their own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;