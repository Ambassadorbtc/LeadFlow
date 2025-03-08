-- Add relationships between tables based on prospect_id

-- Add unique constraint to prospect_id in leads table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'leads_prospect_id_key' AND conrelid = 'leads'::regclass
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_prospect_id_key UNIQUE (prospect_id);
    END IF;
END $$;

-- Add prospect_id to companies table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'prospect_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN prospect_id TEXT;
    END IF;
END $$;

-- Add prospect_id index to companies table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'companies' AND indexname = 'companies_prospect_id_idx'
    ) THEN
        CREATE INDEX companies_prospect_id_idx ON companies(prospect_id);
    END IF;
END $$;

-- Add business_name index to companies table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'companies' AND indexname = 'companies_name_idx'
    ) THEN
        CREATE INDEX companies_name_idx ON companies(name);
    END IF;
END $$;

-- Add contact_name index to contacts table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'contacts' AND indexname = 'contacts_name_idx'
    ) THEN
        CREATE INDEX contacts_name_idx ON contacts(name);
    END IF;
END $$;

-- Add owner index to leads table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_owner_idx'
    ) THEN
        CREATE INDEX leads_owner_idx ON leads(owner);
    END IF;
END $$;

-- Add business_name index to leads table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_business_name_idx'
    ) THEN
        CREATE INDEX leads_business_name_idx ON leads(business_name);
    END IF;
END $$;

-- Add contact_name index to leads table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' AND indexname = 'leads_contact_name_idx'
    ) THEN
        CREATE INDEX leads_contact_name_idx ON leads(contact_name);
    END IF;
END $$;
