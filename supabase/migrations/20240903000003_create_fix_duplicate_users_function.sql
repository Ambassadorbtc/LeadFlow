-- Create function to fix duplicate users
CREATE OR REPLACE FUNCTION fix_duplicate_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB = '{"fixed": []}'::JSONB;
  duplicate_record RECORD;
  primary_id UUID;
  duplicate_count INTEGER := 0;
BEGIN
  -- Find duplicate users based on email
  FOR duplicate_record IN (
    SELECT email, array_agg(id) as ids
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  )
  LOOP
    -- Use the first ID as the primary record
    primary_id := duplicate_record.ids[1];
    
    -- Update any references to the duplicate IDs to point to the primary ID
    -- For each table with a foreign key to users
    
    -- Update leads
    UPDATE leads
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Update deals
    UPDATE deals
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Update contacts
    UPDATE contacts
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Update companies
    UPDATE companies
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Update notifications
    UPDATE notifications
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Update user_settings
    UPDATE user_settings
    SET user_id = primary_id
    WHERE user_id = ANY(duplicate_record.ids[2:]);
    
    -- Delete the duplicate records
    DELETE FROM users
    WHERE id = ANY(duplicate_record.ids[2:]);
    
    -- Add to result
    result := result || jsonb_build_object(
      'fixed', result->'fixed' || jsonb_build_object(
        'email', duplicate_record.email,
        'primary_id', primary_id,
        'removed_ids', duplicate_record.ids[2:]
      )
    );
    
    duplicate_count := duplicate_count + array_length(duplicate_record.ids, 1) - 1;
  END LOOP;
  
  -- Add summary to result
  result := result || jsonb_build_object('duplicate_count', duplicate_count);
  
  RETURN result;
END;
$$;
