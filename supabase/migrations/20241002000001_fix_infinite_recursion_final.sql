-- Drop all existing policies on the users table to avoid conflicts
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

-- Ensure all tables are added to realtime publication
DO $$
DECLARE
  tables TEXT[] := ARRAY['users', 'leads', 'deals', 'contacts', 'companies', 'notifications', 'user_settings', 'system_settings'];
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
