import { NextPage } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  statusCode?: number;
  title?: string;
}

const Error: NextPage<ErrorProps> = ({ statusCode, title }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {title || "An Error Occurred"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An error occurred on client"}
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
