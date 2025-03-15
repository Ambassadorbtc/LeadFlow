import { NextPage } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ServerErrorPage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
        <h1 className="text-4xl font-bold mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">Server Error</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, something went wrong on our server. We're working to fix it.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default ServerErrorPage;
