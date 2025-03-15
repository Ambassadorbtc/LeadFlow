import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

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

    // Get the function names from the request body
    const { functionNames } = await request.json();

    if (
      !functionNames ||
      !Array.isArray(functionNames) ||
      functionNames.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid functionNames in request body",
        },
        { status: 400 },
      );
    }

    // Create a Supabase client with the service key
    const supabase = await createClient();
    const results = [];

    // Attempt to deploy each function
    for (const functionName of functionNames) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

        if (error) {
          results.push({
            functionName,
            success: false,
            error: error.message,
          });
        } else {
          results.push({
            functionName,
            success: true,
            data,
          });
        }
      } catch (error) {
        results.push({
          functionName,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error in deploy-edge-functions route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
