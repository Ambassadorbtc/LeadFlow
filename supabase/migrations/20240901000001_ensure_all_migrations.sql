-- Ensure all migrations are applied

-- Verify RLS policies
DROP POLICY IF EXISTS "Public access" ON users;
CREATE POLICY "Public access"
ON users FOR SELECT
USING (true);

-- Verify all tables have proper indexes
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

-- Enable realtime for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table deals;
alter publication supabase_realtime add table contacts;
alter publication supabase_realtime add table companies;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table user_settings;
