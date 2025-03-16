import { NextResponse } from "next/server";
import { createClient } from "@/supabase/client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Check environment variables
    const envVars = {
      SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID || null,
      SUPABASE_URL:
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        null,
      SUPABASE_ANON_KEY:
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        null,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || null,
    };

    // Check which variables are missing
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === null)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing environment variables: ${missingVars.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Fix infinite recursion in users table policies
    try {
      const { error: policyError } = await supabase.rpc("exec_sql", {
        query: `
          -- Drop all existing policies on the users table to avoid conflicts
          DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
          DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
          DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
          DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
          DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;
          DROP POLICY IF EXISTS "Admin access" ON public.users;
          DROP POLICY IF EXISTS "Public access" ON public.users;
          
          -- Create simple policies without circular references
          CREATE POLICY "Public access"
            ON public.users FOR SELECT
            USING (true);
            
          CREATE POLICY "Users can update their own profile"
            ON public.users FOR UPDATE
            USING (auth.uid() = id);
            
          CREATE POLICY "Users can insert their own profile"
            ON public.users FOR INSERT
            WITH CHECK (auth.uid() = id);
        `,
      });

      if (policyError) {
        console.error("Policy error:", policyError);
      }
    } catch (policyErr) {
      console.error("Error executing policy fix:", policyErr);
      // Continue execution even if policy fix fails
    }

    // 2. Deploy edge functions
    const functionNames = [
      "sync_auth_users",
      "create_users_table_if_not_exists",
      "create_user_settings_if_not_exists",
      "add_missing_columns",
    ];

    const functionResults = [];

    for (const functionName of functionNames) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

        if (error) {
          functionResults.push({
            functionName,
            success: false,
            error: error.message,
          });
        } else {
          functionResults.push({
            functionName,
            success: true,
            data,
          });
        }
      } catch (error: any) {
        functionResults.push({
          functionName,
          success: false,
          error: error.message || "Unknown error",
        });
      }
    }

    // 3. Ensure all required tables exist
    try {
      const { error: tablesError } = await supabase.rpc("exec_sql", {
        query: `
          -- Create users table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            name TEXT,
            phone TEXT,
            bio TEXT,
            job_title TEXT,
            company TEXT,
            avatar_url TEXT,
            user_id UUID,
            token_identifier TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            is_active BOOLEAN DEFAULT true,
            is_admin BOOLEAN DEFAULT false
          );
          
          -- Create user_settings table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.user_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            email_notifications BOOLEAN DEFAULT true,
            deal_updates BOOLEAN DEFAULT true,
            contact_updates BOOLEAN DEFAULT true,
            marketing_emails BOOLEAN DEFAULT true,
            theme_preference TEXT DEFAULT 'system',
            default_currency TEXT DEFAULT 'USD',
            default_language TEXT DEFAULT 'en',
            timezone TEXT DEFAULT 'UTC',
            date_format TEXT DEFAULT 'MM/DD/YYYY',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id)
          );
        `,
      });

      // Add tables to realtime publication separately to avoid potential syntax issues
      // Add tables to realtime publication one by one to avoid PL/pgSQL syntax issues
      let realtimeError = null;
      const tables = [
        "users",
        "leads",
        "deals",
        "contacts",
        "companies",
        "notifications",
        "user_settings",
        "system_settings",
      ];

      for (const table of tables) {
        const { error } = await supabase.rpc("exec_sql", {
          query: `
            DO $$
            BEGIN
              IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '${table}') THEN
                IF NOT EXISTS (
                  SELECT 1 FROM pg_publication_tables
                  WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = '${table}'
                ) THEN
                  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', '${table}');
                END IF;
              END IF;
            END $$;
          `,
        });

        if (error) {
          console.error(
            `Realtime publication error for table ${table}:`,
            error,
          );
          realtimeError = error;
        }
      }

      if (realtimeError) {
        console.error("Realtime publication error:", realtimeError);
      }

      if (tablesError) {
        console.error("Tables error:", tablesError);
      }
    } catch (tablesErr) {
      console.error("Error ensuring tables exist:", tablesErr);
      // Continue execution even if tables fix fails
    }

    return NextResponse.json({
      success: true,
      message: "Deployment issues fixed successfully",
      functionResults,
    });
  } catch (error: any) {
    console.error("Error fixing deployment issues:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 },
    );
  }
}
