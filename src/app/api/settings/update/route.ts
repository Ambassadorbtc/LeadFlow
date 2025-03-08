import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.json();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Skip the setup step as we've created a migration that ensures all columns exist

    // Check if settings exist for this user
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let error;

    if (existingSettings) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from("user_settings")
        .update({
          email_notifications: formData.email_notifications,
          deal_updates: formData.deal_updates,
          contact_updates: formData.contact_updates,
          marketing_emails: formData.marketing_emails,
          theme_preference: formData.theme_preference,
          default_currency: formData.default_currency,
          default_language: formData.default_language,
          timezone: formData.timezone,
          date_format: formData.date_format,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      error = updateError;
    } else {
      // Insert new settings
      const { error: insertError } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          email_notifications: formData.email_notifications,
          deal_updates: formData.deal_updates,
          contact_updates: formData.contact_updates,
          marketing_emails: formData.marketing_emails,
          theme_preference: formData.theme_preference,
          default_currency: formData.default_currency,
          default_language: formData.default_language,
          timezone: formData.timezone,
          date_format: formData.date_format,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      error = insertError;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 },
    );
  }
}
