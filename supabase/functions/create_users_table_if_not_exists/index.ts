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

    // Create users table if it doesn't exist
    const { error: tableError } = await supabaseAdmin.rpc("exec_sql", {
      query: `
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
        
        -- Add missing columns if they don't exist
        DO $
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
                ALTER TABLE public.users ADD COLUMN bio TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
                ALTER TABLE public.users ADD COLUMN phone TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
                ALTER TABLE public.users ADD COLUMN job_title TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
                ALTER TABLE public.users ADD COLUMN company TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
                ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
                ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
                ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
                ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'disable_onboarding') THEN
                ALTER TABLE public.users ADD COLUMN disable_onboarding BOOLEAN DEFAULT false;
            END IF;
        END
        $;
        
        -- Set up RLS for users table
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist to avoid conflicts
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
        
        -- Create policies for users table
        CREATE POLICY "Users can view their own profile"
          ON public.users FOR SELECT
          USING (auth.uid() = id);
        
        CREATE POLICY "Users can update their own profile"
          ON public.users FOR UPDATE
          USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert their own profile"
          ON public.users FOR INSERT
          WITH CHECK (auth.uid() = id);
          
        -- Add to realtime publication if not already added
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = 'users'
          ) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE users';
          END IF;
        END;
        $$;
      `,
    });

    if (tableError) {
      throw new Error(`Error creating users table: ${tableError.message}`);
    }

    // Get all auth users
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Error fetching auth users: ${authError.message}`);
    }

    // Process each auth user
    const results = [];
    for (const user of authUsers.users) {
      // Check if user exists in public.users table
      const { data: existingUser, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "not found"
        results.push({
          id: user.id,
          status: "error",
          message: userError.message,
        });
        continue;
      }

      if (!existingUser) {
        // Create user in public.users table
        const { error: insertError } = await supabaseAdmin
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            user_id: user.id,
            token_identifier: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            is_admin: false,
            onboarding_completed: false,
          });

        if (insertError) {
          results.push({
            id: user.id,
            status: "error",
            message: insertError.message,
          });
        } else {
          results.push({ id: user.id, status: "created" });
        }
      } else {
        results.push({ id: user.id, status: "exists" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: results.filter((r) => r.status === "created").length,
        existing: results.filter((r) => r.status === "exists").length,
        errors: results.filter((r) => r.status === "error").length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in create_users_table_if_not_exists:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
