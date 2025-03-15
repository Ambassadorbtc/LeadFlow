-- Fix user authentication issues
DO $$
BEGIN
  -- Fix the users table to ensure proper constraints
  ALTER TABLE IF EXISTS public.users
    DROP CONSTRAINT IF EXISTS users_pkey;
  
  ALTER TABLE IF EXISTS public.users
    ADD PRIMARY KEY (id);
  
  -- Clean up any duplicate entries for test user
  WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as row_num
    FROM public.users
    WHERE email = 'ibbysj@gmail.com'
  )
  DELETE FROM public.users
  WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
  );
  
  -- Clean up any duplicate entries for admin user
  WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as row_num
    FROM public.users
    WHERE email = 'admin@leadflowapp.online'
  )
  DELETE FROM public.users
  WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
  );
  
  -- Ensure token_identifier is unique
  ALTER TABLE IF EXISTS public.users
    DROP CONSTRAINT IF EXISTS users_token_identifier_key;
  
  ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_token_identifier_key UNIQUE (token_identifier);
END;
$$;