-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT,
  company_name TEXT,
  contact_email TEXT,
  support_email TEXT,
  enable_notifications BOOLEAN DEFAULT true,
  enable_user_registration BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  welcome_message TEXT,
  privacy_policy TEXT,
  terms_of_service TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add to realtime publication if not already added
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'system_settings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE system_settings';
  END IF;
END
$$;
