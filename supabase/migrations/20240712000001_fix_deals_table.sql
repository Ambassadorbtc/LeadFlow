-- Add prospect_id to deals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'prospect_id'
    ) THEN
        ALTER TABLE deals ADD COLUMN prospect_id TEXT;
    END IF;
END $$;

-- Add deal_type to deals table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'deal_type'
    ) THEN
        ALTER TABLE deals ADD COLUMN deal_type TEXT;
    END IF;
END $$;

-- Make sure all required columns exist in the deals table
DO $$ 
BEGIN
    -- Check for contact_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'contact_name'
    ) THEN
        ALTER TABLE deals ADD COLUMN contact_name TEXT;
    END IF;

    -- Check for stage column with default value
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'stage'
    ) THEN
        ALTER TABLE deals ADD COLUMN stage TEXT DEFAULT 'Contact Made';
    END IF;

    -- Check for value column with default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'value'
    ) THEN
        ALTER TABLE deals ADD COLUMN value NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Add indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'deals' AND indexname = 'deals_prospect_id_idx'
    ) THEN
        CREATE INDEX deals_prospect_id_idx ON deals(prospect_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'deals' AND indexname = 'deals_stage_idx'
    ) THEN
        CREATE INDEX deals_stage_idx ON deals(stage);
    END IF;
END $$;
