-- Fix any remaining deployment issues

-- Ensure email_logs table has the correct structure
DO $$
BEGIN
  -- Check if email_logs table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_logs') THEN
    -- Check if recipient_email column exists and email column doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'recipient_email') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'email') THEN
      -- Rename recipient_email to email
      ALTER TABLE public.email_logs RENAME COLUMN recipient_email TO email;
    END IF;
    
    -- Check if email column doesn't exist (in case neither column exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'email') THEN
      -- Add email column
      ALTER TABLE public.email_logs ADD COLUMN email TEXT NOT NULL DEFAULT 'unknown@example.com';
    END IF;
  END IF;
END;
$$;

-- Fix user policies to prevent infinite recursion
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

-- Ensure all tables are in realtime publication
DO $$
DECLARE
  tables TEXT[] := ARRAY['users', 'leads', 'deals', 'contacts', 'companies', 'notifications', 'user_settings', 'system_settings', 'email_logs'];
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