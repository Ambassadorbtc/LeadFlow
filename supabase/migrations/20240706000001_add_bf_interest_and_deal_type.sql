-- Add interested_in_bf column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interested_in_bf BOOLEAN DEFAULT FALSE;

-- Add deal_type column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT;

-- Create index on deal_type
CREATE INDEX IF NOT EXISTS deals_deal_type_idx ON deals(deal_type);

-- Rename deals route to pipeline
CREATE OR REPLACE VIEW pipeline AS SELECT * FROM deals;

-- Add indexes for search optimization
CREATE INDEX IF NOT EXISTS leads_prospect_id_search_idx ON leads USING gin(prospect_id gin_trgm_ops);
CREATE INDEX IF NOT EXISTS leads_business_name_search_idx ON leads USING gin(business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS leads_contact_name_search_idx ON leads USING gin(contact_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contacts_name_search_idx ON contacts USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS companies_name_search_idx ON companies USING gin(name gin_trgm_ops);

-- Enable the pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;
