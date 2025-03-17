import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId, subject, message, notificationType, metadata } =
      await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData?.email) {
      return NextResponse.json(
        { error: "User not found or email not available" },
        { status: 404 },
      );
    }

    // Check user notification preferences
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError) {
      return NextResponse.json(
        { error: "Could not retrieve user settings" },
        { status: 500 },
      );
    }

    // Check if user has enabled email notifications
    if (!userSettings.email_notifications) {
      return NextResponse.json({
        success: false,
        message: "User has disabled email notifications",
      });
    }

    // Check specific notification type preferences
    if (
      (notificationType === "deal" && !userSettings.deal_updates) ||
      (notificationType === "lead" && !userSettings.lead_notifications) ||
      (notificationType === "contact" && !userSettings.contact_updates)
    ) {
      return NextResponse.json({
        success: false,
        message: `User has disabled ${notificationType} notifications`,
      });
    }

    // Log the email in the database
    const { data: logData, error: logError } = await supabase
      .from("email_logs")
      .insert({
        user_id: userId,
        recipient_email: userData.email,
        subject,
        message,
        notification_type: notificationType,
        metadata,
        status: "sent",
      });

    if (logError) {
      console.error("Error logging email:", logError);
      // Continue with the email send even if logging fails
    }

    // In a production environment, you would integrate with an email service here
    // For example, using SendGrid, Mailgun, AWS SES, etc.
    console.log(
      `Sending email to ${userData.email}:\nSubject: ${subject}\nMessage: ${message}`,
    );

    // For now, we'll just simulate a successful email send
    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      recipient: userData.email,
      subject,
      notificationType,
    });
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email notification" },
      { status: 500 },
    );
  }
}
