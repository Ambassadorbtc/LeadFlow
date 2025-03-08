"use client";

import CompanyForm from "@/components/dashboard/company-form";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function EditCompanyClientForm({ company }: { company: any }) {
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
        .from("companies")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", company.id)
        .eq("user_id", user.id);

      if (result.error) {
        console.error("Error updating company:", result.error);
        return false;
      }

      router.push(`/dashboard/companies/${company.id}`);
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return (
    <CompanyForm
      initialData={company}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
