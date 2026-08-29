import { fetchStaff } from "@/app/actions/products";
import { StaffClient } from "./staff-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Manajemen Staff" };

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "owner") {
    redirect("/cashier");
  }

  const staff = await fetchStaff();
  return <StaffClient initialStaff={staff} />;
}
