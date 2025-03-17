-- Fix email_logs table column name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'recipient_email') THEN
    ALTER TABLE public.email_logs RENAME COLUMN recipient_email TO email;
  END IF;
END;
$$;