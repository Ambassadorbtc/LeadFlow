import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();
    const supabase = await createClient();
    const results = {};

    // 1. System health check
    results["system"] = {
      status: "success",
      message: "System is running",
      node_version: process.version,
      environment: process.env.NODE_ENV || "development",
    };

    // 2. Database connection check
    try {
      const dbStartTime = Date.now();
      const { data: dbTest, error: dbError } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      const dbResponseTime = Date.now() - dbStartTime;

      results["database"] = {
        status: dbError ? "error" : "success",
        message: dbError ? dbError.message : "Database connection successful",
        response_time_ms: dbResponseTime,
      };
    } catch (error: any) {
      results["database"] = {
        status: "error",
        message: error.message,
      };
    }

    // 3. Auth system check
    try {
      const authStartTime = Date.now();
      const { data: authData, error: authError } =
        await supabase.auth.getSession();
      const authResponseTime = Date.now() - authStartTime;

      results["auth"] = {
        status: authError ? "error" : "success",
        message: authError ? authError.message : "Auth system is working",
        response_time_ms: authResponseTime,
      };
    } catch (error: any) {
      results["auth"] = {
        status: "error",
        message: error.message,
      };
    }

    // 4. Edge functions check
    try {
      const edgeFnStartTime = Date.now();
      const { data: edgeFunctions, error: edgeFunctionsError } =
        await supabase.functions.list();
      const edgeFnResponseTime = Date.now() - edgeFnStartTime;

      results["edge_functions"] = {
        status: edgeFunctionsError ? "error" : "success",
        message: edgeFunctionsError
          ? edgeFunctionsError.message
          : "Edge functions are accessible",
        response_time_ms: edgeFnResponseTime,
        count: edgeFunctions?.length || 0,
      };
    } catch (error: any) {
      results["edge_functions"] = {
        status: "error",
        message: error.message,
      };
    }

    // 5. Overall performance
    const totalResponseTime = Date.now() - startTime;
    results["performance"] = {
      total_response_time_ms: totalResponseTime,
      status: totalResponseTime > 2000 ? "warning" : "success",
      message:
        totalResponseTime > 2000
          ? "Response time is slow"
          : "Response time is acceptable",
    };

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in health check:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform health check" },
      { status: 500 },
    );
  }
}
