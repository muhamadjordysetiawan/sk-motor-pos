"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Search kendaraan by nomor polisi ──────────────────────────
export async function searchVehicle(plate: string) {
  const supabase = await createClient();
  const cleanPlate = plate.trim().toUpperCase().replace(/\s+/g, "");

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .ilike("license_plate", `%${cleanPlate}%`)
    .limit(10);

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

// ── Riwayat servis kendaraan ──────────────────────────────────
export async function fetchVehicleHistory(plate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_vehicle_history", {
    p_license_plate: plate,
  });

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

// ── Tambah kendaraan baru ─────────────────────────────────────
export async function createVehicle(formData: {
  license_plate: string;
  owner_name: string;
  phone?: string;
  vehicle_type: "motor" | "mobil" | "truk" | "lainnya";
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      ...formData,
      license_plate: formData.license_plate.trim().toUpperCase(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/cashier/vehicles");
  revalidatePath("/owner");
  return { data };
}

// ── Fetch semua transaksi untuk laporan ───────────────────────
export async function fetchTransactions(filters?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  business_unit?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select(`
      *,
      profiles!cashier_id ( full_name ),
      vehicles ( license_plate, owner_name, vehicle_type )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters?.status) query = query.eq("status", filters.status as any);
  if (filters?.start_date) query = query.gte("created_at", `${filters.start_date}T00:00:00`);
  if (filters?.end_date) query = query.lte("created_at", `${filters.end_date}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Void transaksi (Owner only) ───────────────────────────────
export async function voidTransaction(id: string, reason: string, voidedById: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .update({
      status: "voided",
      void_reason: reason,
      voided_by: voidedById,
    })
    .eq("id", id)
    .eq("status", "completed");

  if (error) return { error: error.message };
  revalidatePath("/owner/reports");
  revalidatePath("/owner");
  return { success: true };
}
