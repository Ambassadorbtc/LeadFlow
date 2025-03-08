-- Create lead_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS lead_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS lead_comments_lead_id_idx ON lead_comments(lead_id);

-- Enable row-level security
ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own comments
DROP POLICY IF EXISTS "Users can view their own comments" ON lead_comments;
CREATE POLICY "Users can view their own comments"
  ON lead_comments
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for users to insert their own comments
DROP POLICY IF EXISTS "Users can insert their own comments" ON lead_comments;
CREATE POLICY "Users can insert their own comments"
  ON lead_comments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policy for users to update their own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON lead_comments;
CREATE POLICY "Users can update their own comments"
  ON lead_comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policy for users to delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON lead_comments;
CREATE POLICY "Users can delete their own comments"
  ON lead_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE lead_comments;