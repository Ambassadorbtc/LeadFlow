-- Create exec_sql function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'exec_sql' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result JSONB;
    BEGIN
      EXECUTE query;
      result = '{"success": true}'::JSONB;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      result = jsonb_build_object('success', false, 'error', SQLERRM);
      RETURN result;
    END;
    $$;
  END IF;
END;
$$;
