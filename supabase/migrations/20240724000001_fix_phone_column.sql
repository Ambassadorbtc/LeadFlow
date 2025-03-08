-- Explicitly add the phone column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;