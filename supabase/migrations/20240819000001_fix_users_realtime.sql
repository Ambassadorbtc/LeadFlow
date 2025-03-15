-- Fix users table realtime publication
DO $$ 
BEGIN
    -- Check if users table is already in the publication
    IF EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        -- Do nothing if it's already in the publication
        RAISE NOTICE 'Table users is already in publication supabase_realtime';
    ELSE
        -- Add it to the publication if it's not
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;
