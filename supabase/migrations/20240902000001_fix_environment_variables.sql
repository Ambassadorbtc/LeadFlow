-- Ensure all tables have proper indexes
DO $$ 
BEGIN
    -- Add indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_user_id') THEN
        CREATE INDEX idx_leads_user_id ON leads(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_deals_user_id') THEN
        CREATE INDEX idx_deals_user_id ON deals(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contacts_user_id') THEN
        CREATE INDEX idx_contacts_user_id ON contacts(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_companies_user_id') THEN
        CREATE INDEX idx_companies_user_id ON companies(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
END $$;

-- Enable realtime for all tables if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'deals') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE deals;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contacts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'companies') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE companies;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_settings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
    END IF;
END $$;
