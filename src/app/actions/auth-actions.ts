"use server";

import { createClient } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutServerAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Clear all auth cookies to ensure complete sign-out
    const cookieStore = cookies();
    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.includes("supabase") || cookie.name.includes("auth")) {
        cookieStore.delete(cookie.name);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: "Failed to sign out" };
  }
}
