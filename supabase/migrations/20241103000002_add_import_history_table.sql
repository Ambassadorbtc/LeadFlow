CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  import_type VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  record_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'completed',
  metadata JSONB
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS import_batch_id UUID;

alter publication supabase_realtime add table import_history;