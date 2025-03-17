import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const results = {};

    // 1. Fix database tables
    try {
      // Invoke the create_users_table_if_not_exists edge function
      const { data: usersTableData, error: usersTableError } =
        await supabase.functions.invoke("create_users_table_if_not_exists", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      results["users_table"] = {
        status: usersTableError ? "error" : "success",
        message: usersTableError
          ? usersTableError.message
          : "Users table created or verified",
        data: usersTableData,
      };
    } catch (error: any) {
      results["users_table"] = {
        status: "error",
        message: error.message,
      };
    }

    // 2. Fix user settings
    try {
      // Invoke the create_user_settings_if_not_exists edge function
      const { data: settingsData, error: settingsError } =
        await supabase.functions.invoke("create_user_settings_if_not_exists", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      results["user_settings"] = {
        status: settingsError ? "error" : "success",
        message: settingsError
          ? settingsError.message
          : "User settings created or verified",
        data: settingsData,
      };
    } catch (error: any) {
      results["user_settings"] = {
        status: "error",
        message: error.message,
      };
    }

    // 3. Fix missing columns
    try {
      // Invoke the add_missing_columns edge function
      const { data: columnsData, error: columnsError } =
        await supabase.functions.invoke("add_missing_columns", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      results["missing_columns"] = {
        status: columnsError ? "error" : "success",
        message: columnsError
          ? columnsError.message
          : "Missing columns added or verified",
        data: columnsData,
      };
    } catch (error: any) {
      results["missing_columns"] = {
        status: "error",
        message: error.message,
      };
    }

    // 4. Fix auth and public users sync
    try {
      // Invoke the sync_auth_users edge function
      const { data: syncData, error: syncError } =
        await supabase.functions.invoke("sync_auth_users", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      results["user_sync"] = {
        status: syncError ? "error" : "success",
        message: syncError
          ? syncError.message
          : "Auth and public users synchronized",
        data: syncData,
      };
    } catch (error: any) {
      results["user_sync"] = {
        status: "error",
        message: error.message,
      };
    }

    // 5. Fix RLS policies
    try {
      // Execute SQL to fix RLS policies
      const { data: rlsData, error: rlsError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          -- Users table policies
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
          DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
          DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
          
          CREATE POLICY "Users can view their own profile"
            ON public.users FOR SELECT
            USING (auth.uid() = id);
          
          CREATE POLICY "Users can update their own profile"
            ON public.users FOR UPDATE
            USING (auth.uid() = id);
          
          CREATE POLICY "Users can insert their own profile"
            ON public.users FOR INSERT
            WITH CHECK (auth.uid() = id);
        `,
        },
      );

      results["rls_policies"] = {
        status: rlsError ? "error" : "success",
        message: rlsError
          ? rlsError.message
          : "RLS policies fixed successfully",
        data: rlsData,
      };
    } catch (error: any) {
      results["rls_policies"] = {
        status: "error",
        message: error.message,
      };
    }

    // 6. Fix token_identifier NULL constraint
    try {
      // Execute SQL to fix token_identifier NULL constraint
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          -- Add uuid-ossp extension if not exists
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          -- Alter token_identifier to allow NULL values temporarily
          DO $$ 
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND column_name = 'token_identifier' 
              AND is_nullable = 'NO'
            ) THEN
              ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
            END IF;
          END $$;
          
          -- Update NULL token_identifier values with UUIDs
          UPDATE public.users 
          SET token_identifier = uuid_generate_v4()::text 
          WHERE token_identifier IS NULL;
          
          -- Add NOT NULL constraint back if needed
          -- ALTER TABLE public.users ALTER COLUMN token_identifier SET NOT NULL;
        `,
        },
      );

      results["token_identifier"] = {
        status: tokenError ? "error" : "success",
        message: tokenError
          ? tokenError.message
          : "token_identifier NULL constraint fixed successfully",
        data: tokenData,
      };
    } catch (error: any) {
      results["token_identifier"] = {
        status: "error",
        message: error.message,
      };
    }

    // 7. Add tables to realtime publication
    try {
      const { data: realtimeData, error: realtimeError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          DO $$
          DECLARE
            tables TEXT[] := ARRAY['users', 'leads', 'deals', 'contacts', 'companies', 'notifications', 'user_settings', 'system_settings', 'email_logs', 'import_history'];
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
        },
      );

      results["realtime"] = {
        status: realtimeError ? "error" : "success",
        message: realtimeError
          ? realtimeError.message
          : "Tables added to realtime publication successfully",
        data: realtimeData,
      };
    } catch (error: any) {
      results["realtime"] = {
        status: "error",
        message: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fixing deployment issues:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 },
    );
  }
}
