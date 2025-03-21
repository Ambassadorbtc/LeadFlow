import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import Link from "next/link";

interface LoginProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = searchParams.error
    ? { error: searchParams.error as string }
    : searchParams.success
      ? { success: searchParams.success as string }
      : {};

  if (
    message &&
    Object.keys(message).length > 0 &&
    (message.error || message.success)
  ) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img
            src="/images/leadflow-icon.svg"
            alt="LeadFlow"
            className="h-16 w-16"
          />
        </div>
        <form className="flex flex-col space-y-6" method="post">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome to LeadFlow
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your CRM dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ibbysj@gmail.com"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
                className="w-full"
              />
            </div>
          </div>

          <SubmitButton
            className="w-full bg-blue-600 hover:bg-blue-700"
            pendingText="Signing in..."
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>

          <div className="flex justify-between items-center">
            <Link
              href="/sign-up"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all"
            >
              Don't have an account? Sign up
            </Link>
            <Link
              href="/admin-login"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline transition-all"
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </div>

          <FormMessage message={message} />
        </form>
      </div>
    </div>
  );
}
