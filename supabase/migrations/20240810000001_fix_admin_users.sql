-- First, identify duplicate admin users with the same email
DO $$
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    -- Add a unique constraint on email to prevent future duplicates
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;

  -- Delete duplicate admin users keeping only the most recent one
  WITH duplicate_admin_users AS (
    SELECT id, email, created_at, 
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as row_num
    FROM users
    WHERE email = 'admin@leadflowapp.online'
  )
  DELETE FROM users
  WHERE id IN (
    SELECT id FROM duplicate_admin_users WHERE row_num > 1
  );

  -- Update the remaining admin user to ensure it has the correct name and is marked as active
  UPDATE users
  SET full_name = 'Admin User', is_active = true
  WHERE email = 'admin@leadflowapp.online';
END $$;
