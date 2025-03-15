-- First, ensure the users table exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  name TEXT,
  token_identifier TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_id UUID;
BEGIN
  -- Check if admin user exists in auth.users
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
  END IF;
  
  -- Fix test user (ibbysj@gmail.com)
  -- First check if the user exists in auth.users
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
        -- Update existing user
        UPDATE public.users
        SET is_active = TRUE,
            token_identifier = test_user_id,
            user_id = test_user_id
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
END;
$$;