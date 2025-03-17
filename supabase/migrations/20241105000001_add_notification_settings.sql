-- Add notification-specific settings to user_settings table if they don't exist
DO $$
BEGIN
  -- Add lead_notifications column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'lead_notifications') THEN
    ALTER TABLE user_settings ADD COLUMN lead_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add deal_notifications column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'deal_notifications') THEN
    ALTER TABLE user_settings ADD COLUMN deal_notifications BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add task_notifications column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'task_notifications') THEN
    ALTER TABLE user_settings ADD COLUMN task_notifications BOOLEAN DEFAULT TRUE;
  END IF;

  -- Ensure all existing users have these settings enabled by default
  UPDATE user_settings 
  SET 
    lead_notifications = TRUE, 
    deal_notifications = TRUE, 
    task_notifications = TRUE
  WHERE 
    lead_notifications IS NULL OR 
    deal_notifications IS NULL OR 
    task_notifications IS NULL;

END;
$$;

-- Add table to realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_settings'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
    END IF;
  END IF;
END;
$$;
