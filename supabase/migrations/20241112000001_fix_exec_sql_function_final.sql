-- Drop the existing exec_sql function first
DROP FUNCTION IF EXISTS exec_sql(text);

-- Recreate the exec_sql function with the correct return type
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$;

-- Ensure the email_logs table exists
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT,
  metadata JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_logs table
DROP POLICY IF EXISTS "Users can view their own email logs" ON email_logs;
CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own email logs" ON email_logs;
CREATE POLICY "Users can insert their own email logs"
  ON email_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add email_logs to realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE users, leads, deals, contacts, companies, notifications, user_settings, email_logs;
