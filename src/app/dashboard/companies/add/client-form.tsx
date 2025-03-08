"use client";

import CompanyForm from "@/components/dashboard/company-form";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function AddCompanyClientForm() {
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
        .insert({
          ...data,
          user_id: user.id,
        })
        .select();

      if (result.error) {
        console.error("Error adding company:", result.error);
        return false;
      }

      router.push("/dashboard/companies");
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return <CompanyForm onSubmit={handleSubmit} isLoading={false} />;
}
