-- Add onboarding_completed column to user_settings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_settings' 
                  AND column_name = 'onboarding_completed') THEN
        ALTER TABLE user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Update specific user to skip onboarding
UPDATE user_settings
SET onboarding_completed = TRUE
FROM users
WHERE user_settings.user_id = users.id
AND LOWER(users.email) = 'ibbysj@gmail.com';
