"use client";

import ContactForm from "@/components/dashboard/contact-form";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function EditContactClientForm({ contact }: { contact: any }) {
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
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.id)
        .eq("user_id", user.id);

      if (result.error) {
        console.error("Error updating contact:", result.error);
        return false;
      }

      router.push(`/dashboard/contacts/${contact.id}`);
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return (
    <ContactForm
      initialData={contact}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
