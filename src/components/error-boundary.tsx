"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Caught in error boundary:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Something went wrong!
            </h2>
            <p className="text-muted-foreground mb-6">
              An error occurred while loading this page. Please try again.
            </p>
            <Button
              onClick={() => {
                setHasError(false);
                window.location.href = "/dashboard";
              }}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
