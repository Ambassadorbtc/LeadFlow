-- Add missing interest columns to leads table if they don't exist
DO $$ 
BEGIN
    -- Add ba_interest column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ba_interest') THEN
        ALTER TABLE public.leads ADD COLUMN ba_interest BOOLEAN DEFAULT false;
    END IF;

    -- Add ct_interest column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ct_interest') THEN
        ALTER TABLE public.leads ADD COLUMN ct_interest BOOLEAN DEFAULT false;
    END IF;

    -- Add bf_interest column if it doesn't exist (in case it's missing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bf_interest') THEN
        ALTER TABLE public.leads ADD COLUMN bf_interest BOOLEAN DEFAULT false;
    END IF;

    -- Add deal_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'deal_value') THEN
        ALTER TABLE public.leads ADD COLUMN deal_value NUMERIC DEFAULT 0;
    END IF;

    -- Add to realtime publication
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = 'leads'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE leads;
        END IF;
    END IF;
END;
$$;