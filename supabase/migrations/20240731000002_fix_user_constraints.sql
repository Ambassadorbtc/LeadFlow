-- Fix the test user issue by first removing the constraint if it exists
DO $$
BEGIN
  -- Check if the constraint exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_user_id_key') THEN
    -- Drop the constraint
    ALTER TABLE public.users DROP CONSTRAINT users_user_id_key;
  END IF;

  -- Fix test user (ibbysj@gmail.com)
  DECLARE
    test_user_exists BOOLEAN;
    test_user_id UUID;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'ibbysj@gmail.com'
    ) INTO test_user_exists;
    
    IF test_user_exists THEN
      -- Get the user ID
      SELECT id INTO test_user_id FROM auth.users WHERE email = 'ibbysj@gmail.com';
      
      -- Reset password to '1234567'
      UPDATE auth.users 
      SET encrypted_password = crypt('1234567', gen_salt('bf')),
          email_confirmed_at = NOW(),
          updated_at = NOW()
      WHERE email = 'ibbysj@gmail.com';
      
      -- Ensure user exists in public.users
      IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'ibbysj@gmail.com') THEN
        INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active)
        VALUES (test_user_id, 'ibbysj@gmail.com', 'Test User', 'Test User', test_user_id, test_user_id, NOW(), TRUE);
      ELSE
        -- Update existing user without setting user_id to avoid constraint violation
        UPDATE public.users
        SET is_active = TRUE,
            token_identifier = test_user_id
        WHERE email = 'ibbysj@gmail.com';
      END IF;
    ELSE
      -- Create new test user in auth.users
      INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
      VALUES 
      ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'ibbysj@gmail.com', crypt('1234567', gen_salt('bf')), NOW(), null, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test User"}', NOW(), NOW(), '', null, '', '')
      RETURNING id INTO test_user_id;
      
      -- Create test user in public.users
      INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active)
      VALUES (test_user_id, 'ibbysj@gmail.com', 'Test User', 'Test User', test_user_id, test_user_id, NOW(), TRUE);
    END IF;
  END;

  -- Fix admin user
  DECLARE
    admin_exists BOOLEAN;
    admin_id UUID;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'admin@leadflowapp.online'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
      -- Create admin user in auth.users
      INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
      VALUES 
      ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@leadflowapp.online', crypt('admin123', gen_salt('bf')), NOW(), null, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', NOW(), NOW(), '', null, '', '')
      RETURNING id INTO admin_id;
      
      -- Create admin user in public.users
      INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active)
      VALUES (admin_id, 'admin@leadflowapp.online', 'Admin User', 'Admin User', admin_id, admin_id, NOW(), TRUE);
    ELSE
      -- Get the admin ID
      SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@leadflowapp.online';
      
      -- Reset password to 'admin123'
      UPDATE auth.users 
      SET encrypted_password = crypt('admin123', gen_salt('bf')),
          email_confirmed_at = NOW(),
          updated_at = NOW()
      WHERE email = 'admin@leadflowapp.online';
      
      -- Ensure admin exists in public.users
      IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@leadflowapp.online') THEN
        INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active)
        VALUES (admin_id, 'admin@leadflowapp.online', 'Admin User', 'Admin User', admin_id, admin_id, NOW(), TRUE);
      ELSE
        -- Update existing user without setting user_id to avoid constraint violation
        UPDATE public.users
        SET is_active = TRUE,
            token_identifier = admin_id
        WHERE email = 'admin@leadflowapp.online';
      END IF;
    END IF;
  END;
END;
$$;