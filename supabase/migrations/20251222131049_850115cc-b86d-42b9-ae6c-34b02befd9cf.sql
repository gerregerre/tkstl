-- Drop the existing policy that allows public access
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create new policy that actually requires authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);