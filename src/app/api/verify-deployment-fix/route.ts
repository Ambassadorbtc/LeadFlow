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

    // Try to invoke the sync_auth_users function
    try {
      const { data, error } = await supabase.functions.invoke(
        "sync_auth_users",
        {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        },
      );

      if (error) {
        results.push({
          functionName: "sync_auth_users",
          success: false,
          error: error.message,
        });
      } else {
        results.push({
          functionName: "sync_auth_users",
          success: true,
          data,
        });
      }
    } catch (error: any) {
      results.push({
        functionName: "sync_auth_users",
        success: false,
        error: error.message,
      });
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
            is_admin BOOLEAN DEFAULT false,
            onboarding_completed BOOLEAN DEFAULT false,
            disable_onboarding BOOLEAN DEFAULT false
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
          
          -- Create email_logs table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.email_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL,
            notification_type TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
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
    console.error("Error in verify-deployment-fix route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
