import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, title, message, type, relatedId, relatedType, metadata } =
      await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        related_type: relatedType,
        metadata,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, notification: data[0] });
  } catch (error) {
    console.error("Error in create notification API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
