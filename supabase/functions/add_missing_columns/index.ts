import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    let authToken = "";
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      authToken = authHeader.substring(7);
    }

    // Get Supabase URL from environment variables or headers
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ||
      (Deno.env.get("SUPABASE_PROJECT_ID")
        ? `https://${Deno.env.get("SUPABASE_PROJECT_ID")}.supabase.co`
        : req.headers.get("x-supabase-url"));

    // Get Supabase key from environment variables, auth token, or headers
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_KEY") ||
      authToken ||
      req.headers.get("x-supabase-key") ||
      Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials:", {
        urlAvailable: !!supabaseUrl,
        keyAvailable: !!supabaseKey,
        projectIdAvailable: !!Deno.env.get("SUPABASE_PROJECT_ID"),
        serviceKeyAvailable: !!Deno.env.get("SUPABASE_SERVICE_KEY"),
        anonKeyAvailable: !!Deno.env.get("SUPABASE_ANON_KEY"),
      });

      throw new Error(
        "Supabase credentials not found. Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.",
      );
    }

    console.log("Creating Supabase client with URL:", supabaseUrl);
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Execute SQL to add missing columns
    const { error } = await supabaseAdmin.rpc("exec_sql", {
      query: `
        -- Add missing columns to users table if they don't exist
        DO $$ 
        BEGIN
            -- Add phone column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
                ALTER TABLE public.users ADD COLUMN phone TEXT;
            END IF;

            -- Add bio column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
                ALTER TABLE public.users ADD COLUMN bio TEXT;
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
            
            -- Add is_active column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
                ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
            END IF;
            
            -- Add is_admin column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
                ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
            END IF;
            
            -- Add onboarding_completed column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
                ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
            END IF;
            
            -- Add disable_onboarding column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disable_onboarding') THEN
                ALTER TABLE public.users ADD COLUMN disable_onboarding BOOLEAN DEFAULT false;
            END IF;
            
            -- Add missing columns to leads table
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
                ALTER TABLE public.leads ADD COLUMN phone TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bf_interest') THEN
                ALTER TABLE public.leads ADD COLUMN bf_interest TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ba_interest') THEN
                ALTER TABLE public.leads ADD COLUMN ba_interest TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
                ALTER TABLE public.leads ADD COLUMN notes TEXT;
            END IF;
            
            -- Add missing columns to deals table
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'deal_value') THEN
                ALTER TABLE public.deals ADD COLUMN deal_value NUMERIC;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'bf_interest') THEN
                ALTER TABLE public.deals ADD COLUMN bf_interest TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'ba_interest') THEN
                ALTER TABLE public.deals ADD COLUMN ba_interest TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'deal_type') THEN
                ALTER TABLE public.deals ADD COLUMN deal_type TEXT;
            END IF;
        END $$;
        
        -- Add tables to realtime publication
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
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in add_missing_columns:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
