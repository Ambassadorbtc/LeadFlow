-- Fix infinite recursion in users policy
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Create new policy without the recursive query
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id OR auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin@leadflowapp.online'
));
