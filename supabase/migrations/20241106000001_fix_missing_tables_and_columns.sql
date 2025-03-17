-- Ensure all required tables exist

-- Check and create import_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  import_type TEXT NOT NULL,
  file_name TEXT,
  record_count INTEGER NOT NULL,
  status TEXT DEFAULT 'processing',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add realtime for import_history
ALTER PUBLICATION supabase_realtime ADD TABLE import_history;

-- Check and create lead_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lead_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add realtime for lead_comments
ALTER PUBLICATION supabase_realtime ADD TABLE lead_comments;

-- Ensure leads table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
    ALTER TABLE public.leads ADD COLUMN notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'import_batch_id') THEN
    ALTER TABLE public.leads ADD COLUMN import_batch_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ba_interest') THEN
    ALTER TABLE public.leads ADD COLUMN ba_interest BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bf_interest') THEN
    ALTER TABLE public.leads ADD COLUMN bf_interest BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ct_interest') THEN
    ALTER TABLE public.leads ADD COLUMN ct_interest BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'deal_value') THEN
    ALTER TABLE public.leads ADD COLUMN deal_value NUMERIC(10,2);
  END IF;
END $$;

-- Ensure user_settings table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'disable_onboarding') THEN
    ALTER TABLE public.user_settings ADD COLUMN disable_onboarding BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'email_notifications') THEN
    ALTER TABLE public.user_settings ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'deal_notifications') THEN
    ALTER TABLE public.user_settings ADD COLUMN deal_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'lead_notifications') THEN
    ALTER TABLE public.user_settings ADD COLUMN lead_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'contact_updates') THEN
    ALTER TABLE public.user_settings ADD COLUMN contact_updates BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'deal_updates') THEN
    ALTER TABLE public.user_settings ADD COLUMN deal_updates BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Ensure users table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
    ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_blocked') THEN
    ALTER TABLE public.users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
