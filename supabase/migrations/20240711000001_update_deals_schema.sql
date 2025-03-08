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
