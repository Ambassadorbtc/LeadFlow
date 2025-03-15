import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark single notification as read
    if (notificationId) {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to mark notification as read" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }
    // Mark all notifications as read
    else {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        return NextResponse.json(
          { error: "Failed to mark all notifications as read" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in mark-read API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
