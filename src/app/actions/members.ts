"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { data: [], error: error.message };
  }
  return { data, error: null };
}

export async function searchMember(codeOrPhone: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .or(`member_code.eq.${codeOrPhone},phone.eq.${codeOrPhone}`)
    .single();

  if (error) {
    return { data: null, error: "Member tidak ditemukan" };
  }
  return { data, error: null };
}

export async function createMember(formData: FormData) {
  const supabase = await createClient();
  
  const member_code = formData.get("member_code") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const initial_points = Number(formData.get("points") || 0);

  const { error } = await supabase.from("loyalty_members").insert({
    member_code,
    full_name,
    phone: phone || null,
    points: initial_points
  });

  if (error) return { error: error.message };

  revalidatePath("/cashier/members");
  return { success: true };
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const points = Number(formData.get("points") || 0);

  const { error } = await supabase.from("loyalty_members").update({
    full_name,
    phone: phone || null,
    points,
    updated_at: new Date().toISOString()
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/cashier/members");
  return { success: true };
}
