"use server";

import { createClient } from "@/app/actions";

export async function getUserSettings(userId: string) {
  const supabase = await createClient();

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return userSettings || {};
}

export async function updateUserSettings(userId: string, settings: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
