import { redirect } from "next/navigation";

export default function ConfirmRedirect() {
  redirect("/auth/confirm");
}
