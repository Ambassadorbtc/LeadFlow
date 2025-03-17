-- Fix auth and user synchronization

-- Create a function to sync auth users to public users
CREATE OR REPLACE FUNCTION sync_auth_users_to_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For new users, create a record in public.users
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email, full_name, name, created_at, updated_at, is_active, is_admin, onboarding_completed)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NOW(),
      NOW(),
      TRUE,
      FALSE,
      FALSE
    )
    ON CONFLICT (id) DO NOTHING;
  -- For updated users, update the record in public.users
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET 
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      updated_at = NOW()
    WHERE id = NEW.id;
  -- For deleted users, delete the record in public.users
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE id = OLD.id;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create triggers for auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_users_to_public();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_users_to_public();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_users_to_public();

-- Sync existing auth users to public.users
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT * FROM auth.users
  LOOP
    INSERT INTO public.users (id, email, full_name, name, created_at, updated_at, is_active, is_admin, onboarding_completed)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      NOW(),
      NOW(),
      TRUE,
      FALSE,
      FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
      email = auth_user.email,
      full_name = COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      name = COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      updated_at = NOW();
  END LOOP;
END;
$$;

-- Create user settings for users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id FROM public.users u
    LEFT JOIN public.user_settings s ON u.id = s.user_id
    WHERE s.id IS NULL
  LOOP
    INSERT INTO public.user_settings (user_id, email_notifications, theme_preference, created_at, updated_at)
    VALUES (
      user_record.id,
      TRUE,
      'system',
      NOW(),
      NOW()
    );
  END LOOP;
END;
$$;
