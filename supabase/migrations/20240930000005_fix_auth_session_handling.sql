-- Ensure auth.users table has proper indexes for faster lookups
CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth.users(email);

-- Ensure public.users table has proper indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_token_identifier_idx ON public.users(token_identifier);

-- Update RLS policies to ensure proper authentication
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create new policies
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.users WHERE email = 'admin@leadflowapp.online'));

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Check if users table is already in realtime publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
$$;