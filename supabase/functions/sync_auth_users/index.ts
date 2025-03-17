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
    // Extract credentials from Authorization header if present
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
      console.error("URL available:", !!supabaseUrl, "URL:", supabaseUrl);
      console.error("Key available:", !!supabaseKey);
      console.error(
        "Project ID available:",
        !!Deno.env.get("SUPABASE_PROJECT_ID"),
      );
      console.error(
        "Service Key available:",
        !!Deno.env.get("SUPABASE_SERVICE_KEY"),
      );
      console.error("Anon Key available:", !!Deno.env.get("SUPABASE_ANON_KEY"));
      console.error("Headers:", Object.fromEntries([...req.headers.entries()]));

      // Try to construct URL from project ID if available
      if (Deno.env.get("SUPABASE_PROJECT_ID") && !supabaseUrl) {
        const projectId = Deno.env.get("SUPABASE_PROJECT_ID");
        console.log(
          `Attempting to construct URL from project ID: ${projectId}`,
        );
        supabaseUrl = `https://${projectId}.supabase.co`;
        console.log(`Constructed URL: ${supabaseUrl}`);
      }

      // If we still don't have both URL and key, throw error
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "Supabase credentials not found. Please ensure SUPABASE_PROJECT_ID and SUPABASE_SERVICE_KEY are set.",
        );
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

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
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

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
            disable_onboarding: false,
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

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
