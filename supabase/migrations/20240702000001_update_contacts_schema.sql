-- Update contacts table with new fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS prospect_id TEXT UNIQUE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner TEXT;

-- Create index for faster lookups by prospect_id
CREATE INDEX IF NOT EXISTS idx_contacts_prospect_id ON contacts(prospect_id);

-- Update companies table with address field
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;

-- Create leads table for tracking prospects
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  address TEXT,
  owner TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups by prospect_id
CREATE INDEX IF NOT EXISTS idx_leads_prospect_id ON leads(prospect_id);

-- Add to realtime publication
alter publication supabase_realtime add table leads;