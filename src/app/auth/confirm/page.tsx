import { redirect } from "next/navigation";

export default function ConfirmPage() {
  redirect("/(auth)/confirm");
}
