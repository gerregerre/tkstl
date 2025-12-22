-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create new policy restricting access to authenticated users only
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);