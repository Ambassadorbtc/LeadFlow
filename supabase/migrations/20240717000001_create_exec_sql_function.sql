-- Create a function to execute SQL statements
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
