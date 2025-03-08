"use server";

import { redirect } from "next/navigation";

export async function searchAction(formData: FormData) {
  const searchQuery = formData.get("searchQuery")?.toString() || "";

  if (searchQuery.trim()) {
    redirect(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
  } else {
    redirect("/dashboard");
  }
}
