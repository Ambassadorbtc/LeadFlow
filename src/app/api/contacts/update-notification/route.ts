import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { contactId, action, details } = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!contactId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get current user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    const { user } = userData;

    // Get contact data
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("user_id", user.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found or access denied" },
        { status: 404 },
      );
    }

    // Create notification based on action type
    let title = "";
    let message = "";

    switch (action) {
      case "update":
        title = "Contact Updated";
        message = `Contact ${contact.name} has been updated`;
        break;
      case "create":
        title = "New Contact Created";
        message = `New contact ${contact.name} has been created`;
        break;
      case "delete":
        title = "Contact Deleted";
        message = `Contact ${contact.name} has been deleted`;
        break;
      default:
        title = "Contact Activity";
        message = `Activity recorded for contact ${contact.name}`;
    }

    // Create notification
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/notifications/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title,
            message,
            type: "contact",
            relatedId: contactId,
            relatedType: "contact",
            metadata: {
              contactId,
              contactName: contact.name,
              action,
              details,
            },
          }),
        },
      );

      // Send email notification if user has email notifications enabled
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("email_notifications, contact_updates")
        .eq("user_id", user.id)
        .single();

      if (userSettings?.email_notifications && userSettings?.contact_updates) {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/email-notifications/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              subject: title,
              message,
              notificationType: "contact",
              metadata: {
                contactId,
                contactName: contact.name,
                action,
              },
            }),
          },
        );
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue with the response even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Contact notification created for ${action} action`,
    });
  } catch (error: any) {
    console.error("Error creating contact notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create contact notification" },
      { status: 500 },
    );
  }
}
