-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;

-- Insert last_migration record if it doesn't exist
INSERT INTO system_settings (key, value)
VALUES ('last_migration', '"20240903000001_create_system_settings_table.sql"')
ON CONFLICT (key) DO UPDATE
SET value = '"20240903000001_create_system_settings_table.sql"',
    updated_at = NOW();
