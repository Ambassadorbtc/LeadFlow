-- First, identify duplicate admin users with the same email
CREATE TEMP TABLE duplicate_admin_users AS
SELECT id, email, created_at, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as row_num
FROM users
WHERE email = 'admin@leadflowapp.online';

-- Keep only the most recently created admin user (the one with row_num = 1)
DELETE FROM users
WHERE id IN (
  SELECT id FROM duplicate_admin_users WHERE row_num > 1
);

-- Update the remaining admin user to ensure it has the correct name and is marked as active
UPDATE users
SET full_name = 'Admin User', is_active = true
WHERE email = 'admin@leadflowapp.online';

-- Add a unique constraint on email to prevent future duplicates
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
