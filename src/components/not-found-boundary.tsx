"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotFoundBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NotFoundBoundary({
  children,
  fallback,
}: NotFoundBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Handle not-found errors
    const handleRouteChangeError = (error: Error) => {
      console.error("Route change error caught in boundary:", error);
      setHasError(true);
    };

    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("network error")) {
        console.error("Network error caught in boundary:", event.reason);
        setHasError(true);
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener("unhandledrejection", () => {});
    };
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
            <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or you don't have access
              to it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  setHasError(false);
                  window.location.href = "/dashboard";
                }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Return to Dashboard
              </Button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
