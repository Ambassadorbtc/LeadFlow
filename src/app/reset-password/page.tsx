import { redirect } from "next/navigation";

export default function ResetPasswordRedirect() {
  redirect("/auth/reset-password");
}
