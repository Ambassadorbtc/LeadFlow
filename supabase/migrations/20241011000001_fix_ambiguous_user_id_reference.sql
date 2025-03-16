-- Fix ambiguous user_id reference in previous migrations

DO $$
DECLARE
  auth_user_id uuid; -- Renamed from user_id to avoid ambiguity
  user_exists boolean;
  user_record record;
  admin_user_id uuid;
  test_user_id uuid;
  onboarding_status boolean;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@leadflowapp.online' LIMIT 1;
  
  -- Check if test user exists
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'ibbysj@gmail.com' LIMIT 1;
  
  -- Process admin user if exists
  IF admin_user_id IS NOT NULL THEN
    -- Check if admin user exists in public.users
    SELECT EXISTS(SELECT 1 FROM users WHERE id = admin_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create admin user in public.users if not exists
      INSERT INTO public.users (id, email, created_at, updated_at, is_admin, is_active)
      VALUES (admin_user_id, 'admin@leadflowapp.online', NOW(), NOW(), true, true);
    ELSE
      -- Update admin user in public.users
      UPDATE public.users
      SET is_admin = true, is_active = true, updated_at = NOW()
      WHERE id = admin_user_id;
    END IF;
    
    -- Check if user_settings exists for admin
    IF NOT EXISTS(SELECT 1 FROM user_settings WHERE user_id = admin_user_id) THEN
      -- Create user_settings for admin
      INSERT INTO user_settings (user_id, onboarding_completed, created_at, updated_at)
      VALUES (admin_user_id, true, NOW(), NOW());
    ELSE
      -- Update user_settings for admin
      UPDATE user_settings
      SET onboarding_completed = true, updated_at = NOW()
      WHERE user_id = admin_user_id;
    END IF;
  END IF;
  
  -- Process test user if exists
  IF test_user_id IS NOT NULL THEN
    -- Check if test user exists in public.users
    SELECT EXISTS(SELECT 1 FROM users WHERE id = test_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create test user in public.users if not exists
      INSERT INTO public.users (id, email, created_at, updated_at, is_active)
      VALUES (test_user_id, 'ibbysj@gmail.com', NOW(), NOW(), true);
    ELSE
      -- Update test user in public.users
      UPDATE public.users
      SET is_active = true, updated_at = NOW()
      WHERE id = test_user_id;
    END IF;
    
    -- Check if user_settings exists for test user
    IF NOT EXISTS(SELECT 1 FROM user_settings WHERE user_id = test_user_id) THEN
      -- Create user_settings for test user
      INSERT INTO user_settings (user_id, onboarding_completed, created_at, updated_at)
      VALUES (test_user_id, true, NOW(), NOW());
    ELSE
      -- Update user_settings for test user
      UPDATE user_settings
      SET onboarding_completed = true, updated_at = NOW()
      WHERE user_id = test_user_id;
    END IF;
  END IF;
  
  -- Process all other users
  FOR user_record IN SELECT id, email FROM auth.users WHERE email NOT IN ('admin@leadflowapp.online', 'ibbysj@gmail.com')
  LOOP
    auth_user_id := user_record.id;
    
    -- Check if user exists in public.users
    SELECT EXISTS(SELECT 1 FROM users WHERE id = auth_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create user in public.users if not exists
      INSERT INTO public.users (id, email, created_at, updated_at, is_active)
      VALUES (auth_user_id, user_record.email, NOW(), NOW(), true);
    ELSE
      -- Update user in public.users
      UPDATE public.users
      SET is_active = true, updated_at = NOW()
      WHERE id = auth_user_id;
    END IF;
    
    -- Check if user_settings exists
    IF NOT EXISTS(SELECT 1 FROM user_settings WHERE user_id = auth_user_id) THEN
      -- Create user_settings
      INSERT INTO user_settings (user_id, onboarding_completed, created_at, updated_at)
      VALUES (auth_user_id, false, NOW(), NOW());
    END IF;
  END LOOP;
  
  -- Ensure storage policy for avatars bucket exists
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public, created_at)
    VALUES ('avatars', 'avatars', true, NOW());
    
    -- Create storage policy for avatars bucket
    CREATE POLICY "Avatar images are publicly accessible."
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
    
    -- Create storage policy for authenticated users to upload avatars
    CREATE POLICY "Users can upload their own avatars."
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');
    
    -- Create storage policy for users to update their own avatars
    CREATE POLICY "Users can update their own avatars."
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars');
  END IF;
  
END;
$$;
