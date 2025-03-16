-- First check if the column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Fix user onboarding for specific users
UPDATE user_settings
SET onboarding_completed = true
WHERE user_id IN (
  SELECT id FROM users WHERE email ILIKE 'ibbysj@gmail.com'
);

-- If no record exists, insert one
INSERT INTO user_settings (user_id, onboarding_completed)
SELECT id, true
FROM users
WHERE email ILIKE 'ibbysj@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_id = users.id
);

-- Ensure all users have a user_settings record
INSERT INTO user_settings (user_id, onboarding_completed)
SELECT id, false
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_id = users.id
);
