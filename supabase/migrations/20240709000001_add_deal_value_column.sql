-- Add deal_value column to leads table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'deal_value'
    ) THEN
        ALTER TABLE leads ADD COLUMN deal_value NUMERIC DEFAULT NULL;
    END IF;
END $$;
