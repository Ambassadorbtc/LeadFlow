-- Add uuid-ossp extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix token_identifier NULL constraint
DO $$ 
BEGIN
  -- Alter token_identifier to allow NULL values temporarily
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'token_identifier' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
  END IF;
  
  -- Update NULL token_identifier values with UUIDs
  UPDATE public.users 
  SET token_identifier = uuid_generate_v4()::text 
  WHERE token_identifier IS NULL;
END $$;

-- Add tables to realtime publication
DO $$
DECLARE
  tables TEXT[] := ARRAY['users', 'leads', 'deals', 'contacts', 'companies', 'notifications', 'user_settings', 'system_settings', 'email_logs', 'import_history'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Fix RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin access" ON public.users;
DROP POLICY IF EXISTS "Public access" ON public.users;

-- Create simple policies without circular references
CREATE POLICY "Public access"
  ON public.users FOR SELECT
  USING (true);
  
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
  
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);