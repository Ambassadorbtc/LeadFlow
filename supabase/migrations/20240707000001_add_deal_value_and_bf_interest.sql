-- Add deal_value and bf_interest to leads table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'deal_value'
    ) THEN
        ALTER TABLE leads ADD COLUMN deal_value NUMERIC;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'bf_interest'
    ) THEN
        ALTER TABLE leads ADD COLUMN bf_interest BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add search indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_prospect_id_search_idx'
    ) THEN
        CREATE INDEX leads_prospect_id_search_idx ON leads USING gin(prospect_id gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_business_name_search_idx'
    ) THEN
        CREATE INDEX leads_business_name_search_idx ON leads USING gin(business_name gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_contact_name_search_idx'
    ) THEN
        CREATE INDEX leads_contact_name_search_idx ON leads USING gin(contact_name gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'contacts' AND indexname = 'contacts_name_search_idx'
    ) THEN
        CREATE INDEX contacts_name_search_idx ON contacts USING gin(name gin_trgm_ops);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'companies' AND indexname = 'companies_name_search_idx'
    ) THEN
        CREATE INDEX companies_name_search_idx ON companies USING gin(name gin_trgm_ops);
    END IF;
END $$;

-- Enable the pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;
