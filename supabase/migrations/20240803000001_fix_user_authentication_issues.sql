-- Fix user authentication issues without dropping primary key

-- First, identify and remove any duplicate user records that don't have dependencies
DELETE FROM public.users
WHERE id IN (
  SELECT u.id FROM public.users u
  LEFT JOIN public.deals d ON u.id = d.user_id
  LEFT JOIN public.contacts c ON u.id = c.user_id
  LEFT JOIN public.companies co ON u.id = co.user_id
  LEFT JOIN public.leads l ON u.id = l.user_id
  LEFT JOIN public.lead_comments lc ON u.id = lc.user_id
  WHERE d.id IS NULL AND c.id IS NULL AND co.id IS NULL AND l.id IS NULL AND lc.id IS NULL
  AND u.id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as row_num
      FROM public.users
    ) as duplicates
    WHERE row_num > 1
  )
);

-- Create or replace function for handling auth user creation
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.id,
    NEW.id,
    NOW(),
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_created();

-- Add a function to ensure users table has records for all auth.users
CREATE OR REPLACE FUNCTION sync_missing_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, name, token_identifier, user_id, created_at, is_active, updated_at)
  SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.id,
    au.id,
    COALESCE(au.created_at, NOW()),
    true,
    NOW()
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ON CONFLICT (id) DO NOTHING;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to sync missing users
SELECT sync_missing_users();