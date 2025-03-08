-- Update existing deals to use new pipeline stages
UPDATE deals
SET stage = CASE
  WHEN stage IN ('Qualification', 'Needs Analysis') THEN 'Contact Made'
  WHEN stage IN ('Value Proposition', 'Proposal') THEN 'Quote Sent'
  WHEN stage = 'Closed Won' THEN 'Deal Closed'
  WHEN stage = 'Closed Lost' THEN 'Deal Lost'
  WHEN stage = 'Negotiation' THEN 'Quote Sent'
  ELSE 'Contact Made'
END;

-- Add contact_name column to deals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'contact_name'
    ) THEN
        ALTER TABLE deals ADD COLUMN contact_name TEXT;
    END IF;
END $$;

-- Update deals to include contact_name from leads
UPDATE deals d
SET contact_name = l.contact_name
FROM leads l
WHERE d.prospect_id = l.prospect_id AND d.contact_name IS NULL;
