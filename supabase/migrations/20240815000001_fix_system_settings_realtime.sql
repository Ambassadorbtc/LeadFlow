-- First, drop the table from the publication to avoid the error
ALTER PUBLICATION supabase_realtime DROP TABLE system_settings;

-- Make sure the system_settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT,
  company_name TEXT,
  contact_email TEXT,
  support_email TEXT,
  enable_notifications BOOLEAN DEFAULT TRUE,
  enable_user_registration BOOLEAN DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  welcome_message TEXT,
  privacy_policy TEXT,
  terms_of_service TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for system_settings
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- Add the table back to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
