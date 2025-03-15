-- Drop the foreign key constraint if it exists
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make sure the users table has the correct structure
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_identifier TEXT;
