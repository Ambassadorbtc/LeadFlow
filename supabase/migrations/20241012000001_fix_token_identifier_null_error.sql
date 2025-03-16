-- Fix token_identifier null error in previous migrations

DO $$
DECLARE
  auth_user_id uuid;
  user_exists boolean;
  user_record record;
  admin_user_id uuid;
  test_user_id uuid;
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
      INSERT INTO public.users (id, email, created_at, updated_at, is_admin, is_active, token_identifier)
      VALUES (admin_user_id, 'admin@leadflowapp.online', NOW(), NOW(), true, true, admin_user_id);
    ELSE
      -- Update admin user in public.users
      UPDATE public.users
      SET is_admin = true, is_active = true, updated_at = NOW(), token_identifier = COALESCE(token_identifier, id)
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
      INSERT INTO public.users (id, email, created_at, updated_at, is_active, token_identifier)
      VALUES (test_user_id, 'ibbysj@gmail.com', NOW(), NOW(), true, test_user_id);
    ELSE
      -- Update test user in public.users
      UPDATE public.users
      SET is_active = true, updated_at = NOW(), token_identifier = COALESCE(token_identifier, id)
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
      -- Create user in public.users if not exists with token_identifier set to user id
      INSERT INTO public.users (id, email, created_at, updated_at, is_active, token_identifier)
      VALUES (auth_user_id, user_record.email, NOW(), NOW(), true, auth_user_id);
    ELSE
      -- Update user in public.users and ensure token_identifier is set
      UPDATE public.users
      SET is_active = true, updated_at = NOW(), token_identifier = COALESCE(token_identifier, id)
      WHERE id = auth_user_id;
    END IF;
    
    -- Check if user_settings exists
    IF NOT EXISTS(SELECT 1 FROM user_settings WHERE user_id = auth_user_id) THEN
      -- Create user_settings
      INSERT INTO user_settings (user_id, onboarding_completed, created_at, updated_at)
      VALUES (auth_user_id, false, NOW(), NOW());
    END IF;
  END LOOP;
  
  -- Fix any users with null token_identifier
  UPDATE users SET token_identifier = id WHERE token_identifier IS NULL;
  
END;
$$;