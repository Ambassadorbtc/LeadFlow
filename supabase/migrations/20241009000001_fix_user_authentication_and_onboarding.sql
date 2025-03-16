-- Fix user authentication and onboarding issues

-- Ensure user_settings table exists
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for user_settings
alter publication supabase_realtime add table user_settings;

-- Fix onboarding for specific users
DO $$
DECLARE
  user_id_ibbysj UUID;
  user_id_admin UUID;
BEGIN
  -- Get user IDs for the specific email addresses
  SELECT id INTO user_id_ibbysj FROM auth.users WHERE email ILIKE 'ibbysj@gmail.com' LIMIT 1;
  SELECT id INTO user_id_admin FROM auth.users WHERE email ILIKE 'admin@leadflowapp.online' LIMIT 1;
  
  -- Update user_settings for ibbysj@gmail.com if user exists
  IF user_id_ibbysj IS NOT NULL THEN
    INSERT INTO user_settings (user_id, onboarding_completed)
    VALUES (user_id_ibbysj, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET onboarding_completed = TRUE, updated_at = NOW();
    
    -- Ensure user exists in public.users table
    INSERT INTO public.users (id, email, is_active, token_identifier, user_id)
    VALUES (user_id_ibbysj, 'ibbysj@gmail.com', TRUE, user_id_ibbysj, user_id_ibbysj)
    ON CONFLICT (id) DO UPDATE SET 
      is_active = TRUE, 
      updated_at = NOW();
  END IF;
  
  -- Update user_settings for admin@leadflowapp.online if user exists
  IF user_id_admin IS NOT NULL THEN
    INSERT INTO user_settings (user_id, onboarding_completed)
    VALUES (user_id_admin, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET onboarding_completed = TRUE, updated_at = NOW();
    
    -- Ensure user exists in public.users table
    INSERT INTO public.users (id, email, is_active, token_identifier, user_id)
    VALUES (user_id_admin, 'admin@leadflowapp.online', TRUE, user_id_admin, user_id_admin)
    ON CONFLICT (id) DO UPDATE SET 
      is_active = TRUE, 
      updated_at = NOW();
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
    
    -- Add storage policy to allow authenticated users to upload avatars
    CREATE POLICY "Avatar images are publicly accessible."
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
      
    CREATE POLICY "Anyone can upload an avatar."
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'avatars');
      
    CREATE POLICY "Anyone can update their own avatar."
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'avatars');
  END IF;
END;
$$;
