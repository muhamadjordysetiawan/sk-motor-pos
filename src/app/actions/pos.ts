"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Fetch semua produk aktif untuk POS ────────────────────────
export async function fetchPOSProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products_services")
    .select("id, name, type, business_unit, price, stock_qty, unit, category_id, categories(name)")
    .eq("is_active", true)
    .order("business_unit")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch staff aktif untuk assignment ────────────────────────
export async function fetchActiveStaff() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("is_active", true)
    .in("role", ["mechanic", "washer", "waiter"])
    .order("role")
    .order("full_name");
  return data ?? [];
}

// ── Submit transaksi baru ─────────────────────────────────────
export async function submitTransaction(payload: {
  vehicle_id: string | null;
  cashier_id: string;
  payment_method: "cash" | "transfer" | "qris" | "piutang" | "loyalty";
  discount: number;
  tax: number;
  notes: string;
  wa_phone: string;
  amount_paid: number;
  member_id?: string;
  redeemed_points?: number;
  items: {
    product_id: string;
    qty: number;
    unit_price: number;
    discount: number;
    subtotal: number;
    assigned_staff_id: string | null;
    notes: string;
  }[];
}) {
  const supabase = await createClient();

  // 1. Buat header transaksi (draft dulu)
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .insert({
      vehicle_id: payload.vehicle_id,
      cashier_id: payload.cashier_id,
      status: "draft",
      // member_id: payload.member_id || null, // COMING SOON
      payment_method: payload.payment_method,
      discount: payload.discount,
      tax: payload.tax,
      notes: payload.notes || null,
      wa_phone: payload.wa_phone || null,
      amount_paid: payload.amount_paid,
      change_amount: Math.max(0, payload.amount_paid - (payload.items.reduce((s, i) => s + i.subtotal, 0) - payload.discount + payload.tax)),
    })
    .select()
    .single();

  if (txError || !tx) return { error: txError?.message ?? "Gagal membuat transaksi" };

  // 2. Insert detail items
  const details = payload.items.map((item) => ({
    transaction_id: tx.id,
    product_id: item.product_id,
    assigned_staff_id: item.assigned_staff_id || null,
    qty: item.qty,
    unit_price: item.unit_price,
    discount: item.discount,
    subtotal: item.subtotal,
    notes: item.notes || null,
  }));

  const { error: detailError } = await supabase
    .from("transaction_details")
    .insert(details);

  if (detailError) {
    // Rollback: hapus header kalau detail gagal
    await supabase.from("transactions").delete().eq("id", tx.id);
    return { error: detailError.message };
  }

  // 3. Complete transaksi & override perhitungan (menutupi bug trigger Postgres saat bulk insert)
  const actualSubtotal = payload.items.reduce((s, i) => s + i.subtotal, 0);
  const actualTotal = Math.max(0, actualSubtotal - payload.discount + payload.tax);

  const { data: completed, error: completeError } = await supabase
    .from("transactions")
    .update({ 
      status: "completed",
      subtotal: actualSubtotal,
      total: actualTotal
    })
    .eq("id", tx.id)
    .select(`
      *,
      profiles!cashier_id ( full_name ),
      vehicles ( license_plate, owner_name, vehicle_type ),
      transaction_details (
        qty, unit_price, discount, subtotal, notes,
        products_services ( name, unit, business_unit ),
        profiles!assigned_staff_id ( full_name )
      )
    `)
    // loyalty_members ( full_name, member_code, points ), // COMING SOON
    .single();

  if (completeError) return { error: completeError.message };

  // 4. Update Loyalty Points (COMING SOON)
  // if (payload.member_id) {
  //   const earnedPoints = Math.floor(completed.total / 500000); // 1 Poin tiap kelipatan 500rb
  //   const redeemed = payload.redeemed_points || 0;
  //   
  //   if (earnedPoints > 0 || redeemed > 0) {
  //     const { data: member } = await supabase.from("loyalty_members").select("points").eq("id", payload.member_id).single();
  //     if (member) {
  //       await supabase.from("loyalty_members").update({
  //         points: member.points + earnedPoints - redeemed
  //       }).eq("id", payload.member_id);
  //     }
  //   }
  // }

  revalidatePath("/cashier");
  revalidatePath("/owner");
  return { data: completed };
}

