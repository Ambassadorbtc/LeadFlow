-- Create a function to ensure the users table exists
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.users (
      id UUID PRIMARY KEY,
      email TEXT,
      full_name TEXT,
      name TEXT,
      phone TEXT,
      bio TEXT,
      job_title TEXT,
      company TEXT,
      avatar_url TEXT,
      user_id UUID,
      token_identifier TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Set up RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own profile"
      ON public.users FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile"
      ON public.users FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to ensure the user_settings table exists
CREATE OR REPLACE FUNCTION create_user_settings_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.user_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      email_notifications BOOLEAN DEFAULT true,
      deal_updates BOOLEAN DEFAULT true,
      contact_updates BOOLEAN DEFAULT true,
      marketing_emails BOOLEAN DEFAULT true,
      theme_preference TEXT DEFAULT 'system',
      default_currency TEXT DEFAULT 'USD',
      default_language TEXT DEFAULT 'en',
      timezone TEXT DEFAULT 'UTC',
      date_format TEXT DEFAULT 'MM/DD/YYYY',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id)
    );

    -- Set up RLS
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own settings"
      ON public.user_settings FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own settings"
      ON public.user_settings FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own settings"
      ON public.user_settings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_users_table_if_not_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_settings_if_not_exists() TO authenticated;