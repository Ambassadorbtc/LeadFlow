import { redirect } from "next/navigation";

export default function ResetPasswordPage() {
  redirect("/(auth)/reset-password");
}
