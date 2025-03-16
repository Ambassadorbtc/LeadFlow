-- Fix user authentication and onboarding issues without trying to add user_settings to realtime publication

-- Ensure user_settings table exists with proper structure
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix specific users
DO $$
DECLARE
  auth_user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Fix for ibbysj@gmail.com
  SELECT id INTO auth_user_id FROM auth.users WHERE email = 'ibbysj@gmail.com' LIMIT 1;
  
  IF auth_user_id IS NOT NULL THEN
    -- Check if user exists in public.users
    SELECT EXISTS(SELECT 1 FROM users WHERE id = auth_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create user record if it doesn't exist
      INSERT INTO users (id, email, is_active, token_identifier, user_id, created_at, updated_at)
      VALUES (auth_user_id, 'ibbysj@gmail.com', true, auth_user_id, auth_user_id, NOW(), NOW());
    END IF;
    
    -- Ensure user_settings exists with onboarding_completed = true
    INSERT INTO user_settings (user_id, onboarding_completed)
    VALUES (auth_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET onboarding_completed = true;
  END IF;
  
  -- Fix for admin@leadflowapp.online
  SELECT id INTO auth_user_id FROM auth.users WHERE email = 'admin@leadflowapp.online' LIMIT 1;
  
  IF auth_user_id IS NOT NULL THEN
    -- Check if user exists in public.users
    SELECT EXISTS(SELECT 1 FROM users WHERE id = auth_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create user record if it doesn't exist
      INSERT INTO users (id, email, is_active, token_identifier, user_id, created_at, updated_at)
      VALUES (auth_user_id, 'admin@leadflowapp.online', true, auth_user_id, auth_user_id, NOW(), NOW());
    END IF;
    
    -- Ensure user_settings exists with onboarding_completed = true
    INSERT INTO user_settings (user_id, onboarding_completed)
    VALUES (auth_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET onboarding_completed = true;
  END IF;
END;
$$;

-- Fix any missing columns in users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
    ALTER TABLE users ADD COLUMN full_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
    ALTER TABLE users ADD COLUMN job_title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
    ALTER TABLE users ADD COLUMN company TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END;
$$;

-- Create storage bucket for avatars if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
  END IF;
END;
$$;

-- Create storage policies for avatars bucket
DO $$
BEGIN
  -- Drop policies if they exist to avoid errors
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;
  
  -- Create policies
  CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
    
  CREATE POLICY "Anyone can upload an avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');
    
  CREATE POLICY "Anyone can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars');
    
EXCEPTION WHEN OTHERS THEN
  -- Log error and continue
  RAISE NOTICE 'Error creating policies: %', SQLERRM;
END;
$$;