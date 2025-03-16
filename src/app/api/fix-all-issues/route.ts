import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const fixes = [];

    // 1. Ensure storage buckets exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketNames = buckets?.map((b) => b.name) || [];

    if (!bucketNames.includes("avatars")) {
      const { data, error } = await supabase.storage.createBucket("avatars", {
        public: true,
      });
      if (error) {
        fixes.push({
          type: "Storage",
          status: "Failed",
          message: `Failed to create avatars bucket: ${error.message}`,
        });
      } else {
        fixes.push({
          type: "Storage",
          status: "Success",
          message: "Created avatars bucket",
        });

        // Add storage policies
        try {
          await supabase.rpc("exec_sql", {
            sql_string: `
              CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible."
                ON storage.objects FOR SELECT
                USING (bucket_id = 'avatars');
                
              CREATE POLICY IF NOT EXISTS "Anyone can upload an avatar."
                ON storage.objects FOR INSERT
                WITH CHECK (bucket_id = 'avatars');
                
              CREATE POLICY IF NOT EXISTS "Anyone can update their own avatar."
                ON storage.objects FOR UPDATE
                USING (bucket_id = 'avatars');
            `,
          });
        } catch (policyError) {
          console.log("Policy may already exist, continuing", policyError);
        }
      }
    }

    // 2. Fix specific users
    const specificEmails = ["ibbysj@gmail.com", "admin@leadflowapp.online"];

    for (const email of specificEmails) {
      // Get user from auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserByEmail(email);

      if (authError || !authUser?.user) {
        fixes.push({
          type: "Authentication",
          status: "Failed",
          message: `User not found in auth: ${email}`,
        });
        continue;
      }

      const userId = authUser.user.id;

      // Ensure user exists in public.users
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: email,
          is_active: true,
          token_identifier: userId,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          fixes.push({
            type: "Database",
            status: "Failed",
            message: `Failed to create user record for ${email}: ${insertError.message}`,
          });
        } else {
          fixes.push({
            type: "Database",
            status: "Success",
            message: `Created user record for ${email}`,
          });
        }
      }

      // Ensure user_settings exists with onboarding completed
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            onboarding_completed: true,
          },
          { onConflict: "user_id" },
        );

      if (settingsError) {
        fixes.push({
          type: "Database",
          status: "Failed",
          message: `Failed to update user settings for ${email}: ${settingsError.message}`,
        });
      } else {
        fixes.push({
          type: "Database",
          status: "Success",
          message: `Updated user settings for ${email}`,
        });
      }
    }

    // 3. Ensure all required tables exist with proper columns
    const tableChecks = [
      {
        table: "user_settings",
        sql: `
          CREATE TABLE IF NOT EXISTS user_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Check if table is already in realtime publication before adding
          DO $
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_publication_tables 
              WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'user_settings'
            ) THEN
              ALTER publication supabase_realtime add table user_settings;
            END IF;
          EXCEPTION WHEN OTHERS THEN
            -- Log error and continue
            RAISE NOTICE 'Error adding table to realtime publication: %', SQLERRM;
          END;
          $;
        `,
      },
      {
        table: "users",
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
              ALTER TABLE users ADD COLUMN full_name TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
              ALTER TABLE users ADD COLUMN phone TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
              ALTER TABLE users ADD COLUMN bio TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
              ALTER TABLE users ADD COLUMN job_title TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
              ALTER TABLE users ADD COLUMN company TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
              ALTER TABLE users ADD COLUMN avatar_url TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
              ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
            END IF;
          END;
          $$;
        `,
      },
    ];

    for (const check of tableChecks) {
      try {
        await supabase.rpc("exec_sql", { sql_string: check.sql });
        fixes.push({
          type: "Database",
          status: "Success",
          message: `Ensured table ${check.table} exists with all required columns`,
        });
      } catch (error: any) {
        fixes.push({
          type: "Database",
          status: "Failed",
          message: `Failed to fix table ${check.table}: ${error.message}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      fixes: fixes,
      fixCount: fixes.length,
      message: "Attempted to fix all detected issues",
    });
  } catch (error: any) {
    console.error("Error fixing issues:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        message: "Failed to fix issues",
      },
      { status: 500 },
    );
  }
}
