-- Fix token_identifier null constraint issue

-- First, make token_identifier nullable
DO $$
BEGIN
  -- Check if the column exists and has a not-null constraint
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'token_identifier' 
    AND is_nullable = 'NO'
  ) THEN
    -- Alter the column to allow nulls
    ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
  END IF;
END;
$$;

-- Update the sync_auth_users_to_public function to include token_identifier
CREATE OR REPLACE FUNCTION sync_auth_users_to_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For new users, create a record in public.users
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email, full_name, name, token_identifier, created_at, updated_at, is_active, is_admin)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.id,
      NOW(),
      NOW(),
      TRUE,
      FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Update onboarding_completed if the column exists
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
        UPDATE public.users SET onboarding_completed = FALSE WHERE id = NEW.id AND onboarding_completed IS NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors if column doesn't exist
    END;
    
    -- Update disable_onboarding if the column exists
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disable_onboarding') THEN
        UPDATE public.users SET disable_onboarding = FALSE WHERE id = NEW.id AND disable_onboarding IS NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors if column doesn't exist
    END;
    
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

-- Sync existing auth users to public.users with token_identifier
DO $$
DECLARE
  auth_user RECORD;
  has_onboarding_completed BOOLEAN;
  has_disable_onboarding BOOLEAN;
BEGIN
  -- Check if columns exist
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') INTO has_onboarding_completed;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disable_onboarding') INTO has_disable_onboarding;
  
  FOR auth_user IN SELECT * FROM auth.users
  LOOP
    -- Insert or update basic fields
    INSERT INTO public.users (id, email, full_name, name, token_identifier, created_at, updated_at, is_active, is_admin)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      auth_user.id,
      NOW(),
      NOW(),
      TRUE,
      FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
      email = auth_user.email,
      full_name = COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      name = COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
      token_identifier = auth_user.id,
      updated_at = NOW();
      
    -- Update onboarding_completed if column exists
    IF has_onboarding_completed THEN
      UPDATE public.users SET onboarding_completed = FALSE WHERE id = auth_user.id AND onboarding_completed IS NULL;
    END IF;
    
    -- Update disable_onboarding if column exists
    IF has_disable_onboarding THEN
      UPDATE public.users SET disable_onboarding = FALSE WHERE id = auth_user.id AND disable_onboarding IS NULL;
    END IF;
  END LOOP;
END;
$$;