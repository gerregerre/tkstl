-- Create session_signups table for persisting weekly session signups
CREATE TABLE public.session_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 4),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  signed_up_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one player per slot per session
  UNIQUE (session_date, slot_number),
  -- Prevent same player signing up twice for same session
  UNIQUE (session_date, player_id)
);

-- Enable Row-Level Security
ALTER TABLE public.session_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can view signups (for real-time display)
CREATE POLICY "Anyone can view session signups"
  ON public.session_signups FOR SELECT
  USING (true);

-- Authenticated users can insert signups
CREATE POLICY "Authenticated users can add signups"
  ON public.session_signups FOR INSERT
  WITH CHECK (true);

-- Authenticated users can remove signups
CREATE POLICY "Authenticated users can remove signups"
  ON public.session_signups FOR DELETE
  USING (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_signups;

-- Function to cleanup old session signups (sessions older than 1 hour past)
CREATE OR REPLACE FUNCTION public.cleanup_old_session_signups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.session_signups
  WHERE session_date < now() - INTERVAL '1 hour';
END;
$$;