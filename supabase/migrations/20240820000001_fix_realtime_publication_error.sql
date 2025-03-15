-- This migration fixes the issue with the users table already being in the supabase_realtime publication
-- Instead of trying to add it again, we'll check if it exists first

DO $$
BEGIN
  -- Check if users table exists in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    -- Only add if it doesn't exist
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
END
$$;