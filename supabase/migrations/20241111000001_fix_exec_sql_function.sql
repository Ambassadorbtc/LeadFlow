-- Drop the existing function first
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Recreate the function with the correct return type
CREATE FUNCTION public.exec_sql(query text) RETURNS SETOF record
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$;

-- Create email_logs table if it doesn't exist with correct column names
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
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
