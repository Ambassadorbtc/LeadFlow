import { NextPage } from "next";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  statusCode: number;
  title?: string;
}

const CustomError: NextPage<ErrorProps> = ({ statusCode, title }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(`Error ${statusCode} occurred`);
  }, [statusCode]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
        <h1 className="text-4xl font-bold mb-4">{statusCode || 500}</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {title || `An error ${statusCode} occurred on server`}
        </h2>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

CustomError.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
