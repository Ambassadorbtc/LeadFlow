import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

// Add export const dynamic = 'force-dynamic' to prevent static rendering
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SUPABASE_SERVICE_KEY environment variable",
        },
        { status: 400 },
      );
    }

    if (!process.env.SUPABASE_PROJECT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SUPABASE_PROJECT_ID environment variable",
        },
        { status: 400 },
      );
    }

    // Get the function name from the request body
    const { functionName } = await request.json();

    if (!functionName) {
      return NextResponse.json(
        { success: false, error: "Missing functionName in request body" },
        { status: 400 },
      );
    }

    // Create a Supabase client with the service key
    const supabase = await createClient();

    // Attempt to redeploy the function
    // Note: This is a simplified approach. In a real-world scenario,
    // you might need to use the Supabase Management API to redeploy functions
    const { data, error } = await supabase.functions.invoke(functionName, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    });

    if (error) {
      console.error(`Error redeploying ${functionName}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeployed ${functionName}`,
      data,
    });
  } catch (error: any) {
    console.error("Error in redeploy-edge-function route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
