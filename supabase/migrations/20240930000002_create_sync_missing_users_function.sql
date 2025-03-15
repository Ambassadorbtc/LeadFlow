-- Create function to sync missing users
CREATE OR REPLACE FUNCTION public.sync_missing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through all auth.users
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data->>'full_name' as full_name
    FROM auth.users
  LOOP
    -- Check if user exists in public.users
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
      -- Insert user into public.users
      INSERT INTO public.users (
        id,
        email,
        full_name,
        name,
        token_identifier,
        user_id,
        created_at,
        updated_at,
        is_active
      ) VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.full_name, split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.full_name, split_part(auth_user.email, '@', 1)),
        auth_user.id,
        auth_user.id,
        now(),
        now(),
        true
      );
    END IF;
  END LOOP;
  
  -- Create user settings for users who don't have them
  INSERT INTO public.user_settings (user_id, created_at, updated_at)
  SELECT id, now(), now()
  FROM public.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_settings us WHERE us.user_id = u.id
  );
  
  RETURN;
END;
$$;
