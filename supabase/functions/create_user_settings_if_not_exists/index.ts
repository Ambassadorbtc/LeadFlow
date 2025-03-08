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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Execute SQL to create user_settings table if it doesn't exist
    const { error } = await supabaseClient.rpc("exec_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS public.user_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id),
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
      `,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
