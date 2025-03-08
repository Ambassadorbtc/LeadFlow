import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Execute SQL to ensure all required columns exist
    const { error } = await supabase.rpc("exec_sql", {
      query: `
        -- Add missing columns to users table
        DO $$ 
        BEGIN
            -- Add bio column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
                ALTER TABLE public.users ADD COLUMN bio TEXT;
            END IF;

            -- Add phone column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
                ALTER TABLE public.users ADD COLUMN phone TEXT;
            END IF;

            -- Add job_title column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
                ALTER TABLE public.users ADD COLUMN job_title TEXT;
            END IF;

            -- Add company column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
                ALTER TABLE public.users ADD COLUMN company TEXT;
            END IF;

            -- Add avatar_url column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
                ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
            END IF;

            -- Add additional fields to user_settings table
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'deal_updates') THEN
                ALTER TABLE public.user_settings ADD COLUMN deal_updates BOOLEAN DEFAULT true;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'contact_updates') THEN
                ALTER TABLE public.user_settings ADD COLUMN contact_updates BOOLEAN DEFAULT true;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'marketing_emails') THEN
                ALTER TABLE public.user_settings ADD COLUMN marketing_emails BOOLEAN DEFAULT true;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'default_language') THEN
                ALTER TABLE public.user_settings ADD COLUMN default_language TEXT DEFAULT 'en';
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'timezone') THEN
                ALTER TABLE public.user_settings ADD COLUMN timezone TEXT DEFAULT 'UTC';
            END IF;
        END $$;
      `,
    });

    if (error) {
      console.error("Error setting up database:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in setup-db:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set up database" },
      { status: 500 },
    );
  }
}
