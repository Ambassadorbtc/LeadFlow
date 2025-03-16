-- Ensure all users with specific emails have onboarding_completed set to true
UPDATE user_settings
SET onboarding_completed = true
WHERE user_id IN (
  SELECT id FROM users 
  WHERE LOWER(email) = 'ibbysj@gmail.com' OR LOWER(email) = 'admin@leadflowapp.online'
);

-- If no record exists for these users, create one with onboarding_completed = true
INSERT INTO user_settings (user_id, onboarding_completed)
SELECT id, true
FROM users
WHERE LOWER(email) = 'ibbysj@gmail.com' OR LOWER(email) = 'admin@leadflowapp.online'
AND NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
);
