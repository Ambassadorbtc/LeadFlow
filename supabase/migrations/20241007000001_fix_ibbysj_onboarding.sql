-- Ensure onboarding_completed column exists in user_settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_settings' 
                   AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Fix onboarding status for ibbysj@gmail.com user
DO $$
DECLARE
    user_id_var UUID;
BEGIN
    -- Get user ID for ibbysj@gmail.com (case insensitive)
    SELECT id INTO user_id_var FROM public.users WHERE LOWER(email) = 'ibbysj@gmail.com';
    
    IF user_id_var IS NOT NULL THEN
        -- Update or insert user_settings record
        INSERT INTO public.user_settings (user_id, onboarding_completed)
        VALUES (user_id_var, TRUE)
        ON CONFLICT (user_id) 
        DO UPDATE SET onboarding_completed = TRUE;
    END IF;
END
$$;
