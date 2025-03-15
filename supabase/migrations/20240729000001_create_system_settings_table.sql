-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT DEFAULT 'LeadFlow CRM',
  support_email TEXT DEFAULT 'support@leadflowapp.online',
  enable_user_registration BOOLEAN DEFAULT TRUE,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  enable_in_app_notifications BOOLEAN DEFAULT TRUE,
  max_users INTEGER DEFAULT 100,
  welcome_email_template TEXT DEFAULT '',
  password_reset_email_template TEXT DEFAULT '',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'The system is currently undergoing maintenance. Please check back later.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if table is empty
INSERT INTO system_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- Enable realtime for system_settings table
alter publication supabase_realtime add table system_settings;
