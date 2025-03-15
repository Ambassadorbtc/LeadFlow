-- Fix user authentication issues by ensuring proper constraints and relationships

-- Ensure token_identifier is properly set
UPDATE public.users
SET token_identifier = id
WHERE token_identifier IS NULL OR token_identifier = '';

-- Make sure user_id is properly set
UPDATE public.users
SET user_id = id
WHERE user_id IS NULL OR user_id = '';

-- Ensure is_active flag is set for all users
UPDATE public.users
SET is_active = true
WHERE is_active IS NULL;

-- Add realtime publication for users table if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
$$;