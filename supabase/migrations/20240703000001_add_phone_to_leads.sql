-- Add phone column to leads table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
        ALTER TABLE leads ADD COLUMN phone TEXT;
    END IF;
END $$;