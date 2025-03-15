import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "[SET]"
        : "[MISSING]",
      SUPABASE_URL: process.env.SUPABASE_URL ? "[SET]" : "[MISSING]",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
        ? "[SET]"
        : "[MISSING]",
      SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID
        ? "[SET]"
        : "[MISSING]",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "[SET]" : "[MISSING]",
    };

    // Check which variables are missing
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === "[MISSING]")
      .map(([key]) => key);

    // Construct URL from project ID if available
    let constructedUrl = null;
    if (process.env.SUPABASE_PROJECT_ID) {
      constructedUrl = `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
    }

    return NextResponse.json({
      success: true,
      environment: envVars,
      missingVars,
      constructedUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error checking environment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check environment" },
      { status: 500 },
    );
  }
}
