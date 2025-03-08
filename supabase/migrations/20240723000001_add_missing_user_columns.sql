-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;

    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE public.users ADD COLUMN bio TEXT;
    END IF;

    -- Add job_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
        ALTER TABLE public.users ADD COLUMN job_title TEXT;
    END IF;

    -- Add company column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
        ALTER TABLE public.users ADD COLUMN company TEXT;
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;