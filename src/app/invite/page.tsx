import { redirect } from "next/navigation";

export default function InviteRedirect() {
  redirect("/auth/invite");
}
