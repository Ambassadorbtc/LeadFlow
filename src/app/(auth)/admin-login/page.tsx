import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Shield } from "lucide-react";

interface AdminLoginProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginProps) {
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
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <form className="flex flex-col space-y-6" method="post">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Admin Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your admin credentials to access the control panel
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
                placeholder="admin@leadflowapp.online"
                defaultValue="admin@leadflowapp.online"
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
                defaultValue="admin123"
                required
                className="w-full"
              />
            </div>
          </div>

          <SubmitButton
            className="w-full"
            pendingText="Signing in..."
            formAction={signInAction}
          >
            Sign in to Admin Panel
          </SubmitButton>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all"
            >
              Return to User Login
            </Link>
          </div>

          <FormMessage message={message} />
        </form>
      </div>
    </div>
  );
}
