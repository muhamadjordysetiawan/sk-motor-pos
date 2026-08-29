"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Fetch laporan transaksi dengan filter ─────────────────────
export async function fetchReportTransactions(filters: {
  start_date: string;
  end_date: string;
  status?: string;
  business_unit?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id, invoice_number, status, payment_method,
      subtotal, discount, tax, total, amount_paid, change_amount,
      notes, void_reason, created_at, completed_at, voided_at,
      profiles!cashier_id ( id, full_name ),
      vehicles ( license_plate, owner_name, vehicle_type ),
      transaction_details (
        qty, unit_price, discount, subtotal,
        products_services ( name, business_unit, type )
      )
    `)
    .gte("created_at", `${filters.start_date}T00:00:00+00:00`)
    .lte("created_at", `${filters.end_date}T23:59:59+00:00`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let result = data ?? [];

  // Filter status
  if (filters.status && filters.status !== "all") {
    result = result.filter((t: any) => t.status === filters.status);
  }

  // Filter unit bisnis — berdasarkan apakah ada item dari unit tsb
  if (filters.business_unit && filters.business_unit !== "all") {
    result = result.filter((t: any) =>
      (t.transaction_details ?? []).some(
        (d: any) => d.products_services?.business_unit === filters.business_unit
      )
    );
  }

  return result;
}

// ── Summary revenue per unit bisnis ──────────────────────────
export async function fetchRevenueSummary(start_date: string, end_date: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      total, discount, status, completed_at,
      transaction_details (
        subtotal,
        products_services ( business_unit )
      )
    `)
    .eq("status", "completed")
    .gte("completed_at", `${start_date}T00:00:00+00:00`)
    .lte("completed_at", `${end_date}T23:59:59+00:00`);

  if (error) throw new Error(error.message);

  const summary = { repair: 0, wash: 0, cafe: 0, total: 0, count: 0 };

  (data ?? []).forEach((tx: any) => {
    summary.count++;
    summary.total += tx.total ?? 0;
    (tx.transaction_details ?? []).forEach((d: any) => {
      const unit = d.products_services?.business_unit;
      if (unit === "repair") summary.repair += d.subtotal ?? 0;
      else if (unit === "wash") summary.wash += d.subtotal ?? 0;
      else if (unit === "cafe") summary.cafe += d.subtotal ?? 0;
    });
  });

  return summary;
}

// ── Fetch pengeluaran ─────────────────────────────────────────
export async function fetchExpenses(start_date: string, end_date: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*, profiles!recorded_by(full_name)")
    .gte("expense_date", start_date)
    .lte("expense_date", end_date)
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Tambah pengeluaran ────────────────────────────────────────
export async function createExpense(payload: {
  business_unit: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").insert({
    ...payload,
    business_unit: payload.business_unit as any,
  });

  if (error) return { error: error.message };
  revalidatePath("/owner/reports");
  return { success: true };
}

// ── Void transaksi ────────────────────────────────────────────
export async function voidTransactionAction(
  id: string,
  reason: string,
  voidedBy: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .update({
      status: "voided" as any,
      void_reason: reason,
      voided_by: voidedBy,
    })
    .eq("id", id)
    .eq("status", "completed" as any);

  if (error) return { error: error.message };
  revalidatePath("/owner/reports");
  revalidatePath("/owner");
  return { success: true };
}
