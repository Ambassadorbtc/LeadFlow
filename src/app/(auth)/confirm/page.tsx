import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { createClient } from "@/app/actions";

export default async function ConfirmEmail(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Check if user is already confirmed
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isConfirmed = session?.user?.email_confirmed_at;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                {isConfirmed ? "Email Confirmed" : "Confirm Your Email"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isConfirmed
                  ? "Your email has been successfully confirmed."
                  : "Please check your email and click the confirmation link to verify your account."}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              {isConfirmed ? (
                <>
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-green-600"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-blue-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Didn't receive an email? Check your spam folder or
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/sign-in">Return to Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            {"message" in searchParams && (
              <FormMessage message={searchParams} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
