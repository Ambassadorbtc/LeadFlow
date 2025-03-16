-- Add ba_interest column to leads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ba_interest') THEN
        ALTER TABLE leads ADD COLUMN ba_interest BOOLEAN DEFAULT false;
    END IF;
END
$$;