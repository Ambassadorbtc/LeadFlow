-- Create email_logs table to track all email notifications sent
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_notification_type_idx ON email_logs(notification_type);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON email_logs(created_at);

-- Enable row level security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own email logs" ON email_logs;
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

DROP POLICY IF EXISTS "System can insert email logs" ON email_logs;
CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
