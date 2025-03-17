-- Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT,
  metadata JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
CREATE POLICY "Users can view their own email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
CREATE POLICY "Admins can view all email logs"
  ON public.email_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_logs;
