import { fetchStaff } from "@/app/actions/products";
import { StaffClient } from "./staff-client";

export const metadata = { title: "Manajemen Staff" };

export default async function StaffPage() {
  const staff = await fetchStaff();
  return <StaffClient initialStaff={staff} />;
}
