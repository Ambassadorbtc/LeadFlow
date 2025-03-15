-- Fix potential issues with users table
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS public.users ADD PRIMARY KEY (id);

-- Make sure token_identifier is unique
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_token_identifier_key;
ALTER TABLE IF EXISTS public.users ADD CONSTRAINT users_token_identifier_key UNIQUE (token_identifier);

-- Fix potential issues with email uniqueness
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Create function to sync missing users
CREATE OR REPLACE FUNCTION public.sync_missing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert missing users from auth.users into public.users
  INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active)
  SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'full_name', au.email), 
    COALESCE(au.raw_user_meta_data->>'full_name', au.email), 
    au.id, 
    au.id, 
    COALESCE(au.created_at, NOW()), 
    true
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ON CONFLICT (id) DO NOTHING;
  
  RETURN;
END;
$$;

-- Run the function to sync any missing users
SELECT public.sync_missing_users();
