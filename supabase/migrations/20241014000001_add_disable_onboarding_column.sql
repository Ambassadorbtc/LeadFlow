-- Add disable_onboarding column to user_settings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_settings' 
                   AND column_name = 'disable_onboarding') THEN
        ALTER TABLE public.user_settings ADD COLUMN disable_onboarding BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Set disable_onboarding to true for specific users
UPDATE public.user_settings
SET disable_onboarding = TRUE, onboarding_completed = TRUE
FROM public.users
WHERE public.user_settings.user_id = public.users.id
AND LOWER(public.users.email) IN ('ibbysj@gmail.com', 'admin@leadflowapp.online');

-- Make sure onboarding is completed for these users
INSERT INTO public.user_settings (user_id, onboarding_completed, disable_onboarding)
SELECT id, TRUE, TRUE
FROM public.users
WHERE LOWER(email) IN ('ibbysj@gmail.com', 'admin@leadflowapp.online')
AND NOT EXISTS (
    SELECT 1 FROM public.user_settings WHERE user_settings.user_id = users.id
);
