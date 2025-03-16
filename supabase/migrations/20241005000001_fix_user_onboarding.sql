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
