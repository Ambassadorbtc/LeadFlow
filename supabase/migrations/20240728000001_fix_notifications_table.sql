-- Check if the notifications table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      related_id UUID,
      related_type TEXT,
      metadata JSONB
    );

    -- Add index for faster queries
    CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
    CREATE INDEX notifications_read_idx ON public.notifications(read);
    CREATE INDEX notifications_created_at_idx ON public.notifications(created_at);

    -- Enable row level security
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    -- Create policy for users to see only their notifications
    CREATE POLICY "Users can view their own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);

    -- Create policy for users to update only their notifications
    CREATE POLICY "Users can update their own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);

    -- Add to realtime publication if it exists
    IF EXISTS (SELECT FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END
$$;