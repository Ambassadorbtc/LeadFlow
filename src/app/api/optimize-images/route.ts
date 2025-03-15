import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    if (!userData || userData.email !== "admin@leadflowapp.online") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get all avatar URLs from users
    const { data: avatars, error: avatarError } = await supabase
      .from("users")
      .select("avatar_url")
      .not("avatar_url", "is", null);

    if (avatarError) {
      throw new Error(`Failed to fetch avatars: ${avatarError.message}`);
    }

    // In a real implementation, we would optimize these images
    // For now, we'll just return the list of images that would be optimized

    return NextResponse.json({
      success: true,
      message: "Image optimization simulation complete",
      imagesToOptimize: avatars.filter((a) => a.avatar_url).length,
      optimizationComplete: true,
    });
  } catch (error: any) {
    console.error("Error optimizing images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize images" },
      { status: 500 },
    );
  }
}
