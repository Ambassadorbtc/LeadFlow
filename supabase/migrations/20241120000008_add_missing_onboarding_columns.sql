-- Add missing onboarding columns if they don't exist

DO $$
BEGIN
  -- Add onboarding_completed column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;
  
  -- Add disable_onboarding column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disable_onboarding') THEN
    ALTER TABLE public.users ADD COLUMN disable_onboarding BOOLEAN DEFAULT false;
  END IF;
END;
$$;