-- Drop the problematic foreign key constraint if it exists
ALTER TABLE IF EXISTS "public"."users" DROP CONSTRAINT IF EXISTS "users_id_fkey";

-- Ensure the users table has the correct primary key
ALTER TABLE IF EXISTS "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE IF EXISTS "public"."users" ADD PRIMARY KEY ("id");

-- Update the realtime publication
ALTER PUBLICATION IF EXISTS supabase_realtime ADD TABLE "public"."users";
