import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/app/actions";
import SubmitButton from "@/components/submit-button";
import FormMessage from "@/components/form-message";
import { SMTPMessage } from "../(auth)/smtp-message";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80"
            alt="Authentication"
            className="h-full w-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img
            src="/images/leadflow-logo-with-icon.svg"
            alt="LeadFlow"
            width={150}
            height={40}
            className="invert"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This CRM has completely transformed how our sales team
              operates. We&apos;ve increased our close rate by 40% since
              implementing it.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/images/leadflow-logo-with-icon.svg"
                alt="LeadFlow"
                width={180}
                height={45}
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <div className="grid gap-6">
            <form action={signUpAction}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect="off"
                    required
                  />
                </div>
                <FormMessage />
                <SubmitButton>Sign Up</SubmitButton>
              </div>
            </form>
            <SMTPMessage />
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
