-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create simplified policies that avoid recursion completely
CREATE POLICY "Allow users to view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create a separate policy for admin access that doesn't use recursion
CREATE POLICY "Allow admin to view all profiles"
  ON public.users FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@leadflowapp.online'
  ));