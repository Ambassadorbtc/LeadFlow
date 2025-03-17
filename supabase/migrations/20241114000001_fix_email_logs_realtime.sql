-- Check if email_logs table exists in realtime publication before adding it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_logs') THEN
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'email_logs'
    ) THEN
      -- Table is already in the publication, do nothing
      RAISE NOTICE 'email_logs table is already in supabase_realtime publication';
    ELSE
      -- Table exists but is not in the publication, add it
      ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
    END IF;
  END IF;
END;
$$;