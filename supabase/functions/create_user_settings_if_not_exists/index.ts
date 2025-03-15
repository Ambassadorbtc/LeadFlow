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

    // Hard-code the Supabase URL and key from environment variables
    let supabaseUrl = Deno.env.get("SUPABASE_PROJECT_ID")
      ? `https://${Deno.env.get("SUPABASE_PROJECT_ID")}.supabase.co`
      : req.headers.get("x-supabase-url") || Deno.env.get("SUPABASE_URL");

    // Try to get the service key directly
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_KEY") ||
      authToken ||
      req.headers.get("x-supabase-key") ||
      Deno.env.get("SUPABASE_ANON_KEY"); // Fallback to anon key if service key is not available

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase credentials not found. Please ensure SUPABASE_PROJECT_ID and SUPABASE_SERVICE_KEY are set.",
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Execute SQL to create user_settings table if it doesn't exist
    const { error } = await supabaseAdmin.rpc("exec_sql", {
      query: `
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
        
        -- Add missing columns if they don't exist
        DO $
        BEGIN
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
        END
        $;
        
        -- Set up RLS for user_settings table
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist to avoid conflicts
        DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
        DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
        DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
        
        -- Create policies for user_settings table
        CREATE POLICY "Users can view their own settings"
          ON public.user_settings FOR SELECT
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own settings"
          ON public.user_settings FOR UPDATE
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own settings"
          ON public.user_settings FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
        -- Add to realtime publication if not already added
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = 'user_settings'
          ) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE user_settings';
          END IF;
        END;
        $$;
      `,
    });

    if (error) throw error;

    // Get all users without settings
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id")
      .not("id", "in", supabaseAdmin.from("user_settings").select("user_id"));

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    // Create settings for users who don't have them
    const results = [];
    for (const user of users) {
      const { data: setting, error: settingError } = await supabaseAdmin
        .from("user_settings")
        .insert({
          user_id: user.id,
          theme_preference: "system",
          email_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (settingError) {
        results.push({
          user_id: user.id,
          status: "error",
          message: settingError.message,
        });
      } else {
        results.push({ user_id: user.id, status: "created", setting });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: results.filter((r) => r.status === "created").length,
        errors: results.filter((r) => r.status === "error").length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
