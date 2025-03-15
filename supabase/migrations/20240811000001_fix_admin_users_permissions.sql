-- Skip creating the unique constraint since it already exists
-- Instead, just ensure admin user exists and has proper permissions

-- First, make sure the admin user exists in the public.users table
INSERT INTO public.users (id, email, full_name, is_active, created_at)
SELECT 
  auth.uid(), 
  'admin@leadflowapp.online', 
  'Admin User', 
  true, 
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'admin@leadflowapp.online'
);

-- Enable row level security on the users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow admin to read all users
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
CREATE POLICY "Admin can view all users"
  ON public.users
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@leadflowapp.online');

-- Create policy to allow admin to update all users
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
CREATE POLICY "Admin can update all users"
  ON public.users
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@leadflowapp.online');

-- Create policy to allow admin to delete users
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
CREATE POLICY "Admin can delete users"
  ON public.users
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@leadflowapp.online');

-- Create policy to allow admin to insert users
DROP POLICY IF EXISTS "Admin can insert users" ON public.users;
CREATE POLICY "Admin can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@leadflowapp.online');
