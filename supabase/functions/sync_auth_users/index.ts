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

          // Create user settings for the new user
          const { error: settingsError } = await supabaseAdmin
            .from("user_settings")
            .insert({
              user_id: user.id,
              email_notifications: true,
              theme_preference: "system",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (settingsError) {
            console.error(
              `Error creating settings for user ${user.id}:`,
              settingsError.message,
            );
          }
        }
      } else {
        // Update existing user
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          results.push({
            id: user.id,
            status: "error",
            message: updateError.message,
          });
        } else {
          results.push({ id: user.id, status: "updated" });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in sync_auth_users:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
