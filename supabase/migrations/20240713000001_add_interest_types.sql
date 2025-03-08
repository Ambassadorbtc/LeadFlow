-- Add new interest type columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ct_interest BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ba_interest BOOLEAN DEFAULT FALSE;

-- Update the publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
