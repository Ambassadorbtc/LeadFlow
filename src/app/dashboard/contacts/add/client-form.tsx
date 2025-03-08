"use client";

import ContactForm from "@/components/dashboard/contact-form";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function AddContactClientForm() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (data: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      const result = await supabase
        .from("contacts")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select();

      if (result.error) {
        console.error("Error adding contact:", result.error);
        return false;
      }

      router.push("/dashboard/contacts");
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return <ContactForm onSubmit={handleSubmit} isLoading={false} />;
}
