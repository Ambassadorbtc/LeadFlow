-- Make sure system_settings table has all the required fields
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS site_name TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS support_email TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS enable_user_registration BOOLEAN DEFAULT true;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS privacy_policy TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS terms_of_service TEXT;

-- Fix RLS policies
DROP POLICY IF EXISTS "Admins can read system_settings" ON system_settings;
CREATE POLICY "Admins can read system_settings"
  ON system_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert system_settings" ON system_settings;
CREATE POLICY "Admins can insert system_settings"
  ON system_settings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update system_settings" ON system_settings;
CREATE POLICY "Admins can update system_settings"
  ON system_settings FOR UPDATE
  USING (true);
