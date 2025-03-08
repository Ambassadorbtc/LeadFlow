-- Add bf_interest column to leads table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'bf_interest'
    ) THEN
        ALTER TABLE leads ADD COLUMN bf_interest BOOLEAN DEFAULT false;
    END IF;
END $$;
