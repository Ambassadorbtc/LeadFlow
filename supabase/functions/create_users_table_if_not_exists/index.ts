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

    // Execute SQL to create users table if it doesn't exist
    const { error } = await supabaseClient.rpc("exec_sql", {
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
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
