-- First check if the table exists in the publication before trying to add it
DO $$
BEGIN
  -- Create email_logs table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Fix the exec_sql function if it doesn't exist
  CREATE OR REPLACE FUNCTION public.exec_sql(query text) RETURNS SETOF record
  LANGUAGE plpgsql SECURITY DEFINER
  AS $$
  BEGIN
    RETURN QUERY EXECUTE query;
  END;
  $$;

  -- Create RLS policy for email_logs if it doesn't exist
  DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
  CREATE POLICY "Users can view their own email logs"
    ON public.email_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  -- Enable RLS on email_logs
  ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

END;
$$;