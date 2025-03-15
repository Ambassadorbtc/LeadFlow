import { NextResponse } from "next/server";

// Add export const dynamic = 'force-dynamic' to prevent static rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check for required environment variables
    const envVars = {
      SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID || null,
      SUPABASE_URL:
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        null,
      SUPABASE_ANON_KEY:
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        null,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || null,
    };

    // Check which variables are missing
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === null)
      .map(([key]) => key);

    // Mask sensitive keys for security
    const maskedVars = {
      ...envVars,
      SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? "[PRESENT]" : null,
      SUPABASE_SERVICE_KEY: envVars.SUPABASE_SERVICE_KEY ? "[PRESENT]" : null,
    };

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required environment variables",
          missingVars,
          envStatus: maskedVars,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "All required environment variables are set",
      envStatus: maskedVars,
    });
  } catch (error: any) {
    console.error("Error in verify-env route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
