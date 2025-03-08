"use server";

import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
