import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Check if we have the required environment variables
    if (!process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SUPABASE_SERVICE_KEY environment variable",
        },
        { status: 400 },
      );
    }

    if (!process.env.SUPABASE_PROJECT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SUPABASE_PROJECT_ID environment variable",
        },
        { status: 400 },
      );
    }

    // Create a Supabase client with the service key
    const supabase = await createClient();
    const results = [];

    // List of all required edge functions
    const functionNames = [
      "sync_auth_users",
      "create_users_table_if_not_exists",
      "create_user_settings_if_not_exists",
      "add_missing_columns",
    ];

    // Attempt to deploy each function
    for (const functionName of functionNames) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

        if (error) {
          results.push({
            functionName,
            success: false,
            error: error.message,
          });
        } else {
          results.push({
            functionName,
            success: true,
            data,
          });
        }
      } catch (error: any) {
        results.push({
          functionName,
          success: false,
          error: error.message,
        });
      }
    }

    // Now try to set up the database tables
    try {
      // Execute SQL to ensure all required tables exist
      const { error: setupError } = await supabase.rpc("exec_sql", {
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
          
          -- Add tables to realtime publication
          DO $$
          DECLARE
            tables TEXT[] := ARRAY['users', 'leads', 'deals', 'contacts', 'companies', 'notifications', 'user_settings', 'system_settings'];
            t TEXT;
          BEGIN
            FOREACH t IN ARRAY tables
            LOOP
              IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
                IF NOT EXISTS (
                  SELECT 1 FROM pg_publication_tables
                  WHERE pubname = 'supabase_realtime'
                  AND schemaname = 'public'
                  AND tablename = t
                ) THEN
                  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
                END IF;
              END IF;
            END LOOP;
          END;
          $$;
        `,
      });

      if (setupError) {
        results.push({
          functionName: "database_setup",
          success: false,
          error: setupError.message,
        });
      } else {
        results.push({
          functionName: "database_setup",
          success: true,
        });
      }
    } catch (error: any) {
      results.push({
        functionName: "database_setup",
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error in deploy-all-edge-functions route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
