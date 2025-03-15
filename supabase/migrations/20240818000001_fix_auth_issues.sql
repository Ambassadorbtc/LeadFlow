-- Ensure users table exists with all required fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  name TEXT,
  user_id UUID,
  token_identifier UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user'
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public access" ON public.users;
CREATE POLICY "Public access"
  ON public.users FOR SELECT
  USING (true);

-- Add realtime support
alter publication supabase_realtime add table public.users;
