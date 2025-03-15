import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      throw new Error(`Database connection error: ${testError.message}`);
    }

    // Test critical API endpoints by making internal requests
    const endpoints = [
      "/api/notifications",
      "/api/sync-users",
      "/api/setup-db",
      "/api/verify-deployment",
      "/api/env-check",
      "/api/health",
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${endpoint}`,
        );
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
        };
      } catch (error: any) {
        results[endpoint] = {
          error: error.message,
          ok: false,
        };
      }
    }

    return NextResponse.json({
      success: true,
      databaseConnected: !testError,
      apiEndpoints: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error testing API routes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to test API routes" },
      { status: 500 },
    );
  }
}
