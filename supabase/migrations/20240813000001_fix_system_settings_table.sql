-- Check if system_settings table exists and create it if it doesn't
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

-- Enable row level security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read and write
DROP POLICY IF EXISTS "Admins can read system_settings" ON system_settings;
CREATE POLICY "Admins can read system_settings"
  ON system_settings FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can insert system_settings" ON system_settings;
CREATE POLICY "Admins can insert system_settings"
  ON system_settings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update system_settings" ON system_settings;
CREATE POLICY "Admins can update system_settings"
  ON system_settings FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Enable realtime
alter publication supabase_realtime add table system_settings;
