-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  deal_updates BOOLEAN DEFAULT TRUE,
  contact_updates BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  theme_preference TEXT DEFAULT 'system',
  default_currency TEXT DEFAULT 'USD',
  default_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create function to delete user account and related data
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete user data from various tables
  DELETE FROM user_settings WHERE user_id = $1;
  DELETE FROM leads WHERE user_id = $1;
  DELETE FROM contacts WHERE user_id = $1;
  DELETE FROM deals WHERE user_id = $1;
  DELETE FROM companies WHERE user_id = $1;
  DELETE FROM users WHERE id = $1;
  
  -- Note: In a real application, you would need to handle auth.users deletion
  -- through a secure process, possibly involving admin confirmation
  -- This function only deletes application data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for selecting user's own settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting user's own settings
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating user's own settings
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for deleting user's own settings
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);
