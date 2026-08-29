"use server";

import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/constants";

// ── Dashboard KPI ──────────────────────────────────────────────
export async function fetchDashboardStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [txToday, txMonth, lowStock, recentTx] = await Promise.all([
    // Transaksi hari ini (completed)
    supabase
      .from("transactions")
      .select("total")
      .eq("status", "completed")
      .gte("completed_at", `${today}T00:00:00`)
      .lte("completed_at", `${today}T23:59:59`)
      .returns<{ total: number }[]>(),

    // Transaksi bulan ini
    supabase
      .from("transactions")
      .select("total")
      .eq("status", "completed")
      .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .returns<{ total: number }[]>(),

    // Produk stok menipis
    supabase
      .from("products_services")
      .select("id, name, stock_qty, low_stock_threshold, unit, business_unit")
      .eq("type", "product")
      .eq("is_active", true)
      .filter("stock_qty", "lte", "low_stock_threshold"),

    // 5 transaksi terkini
    supabase
      .from("transactions")
      .select("id, invoice_number, total, status, created_at, profiles!cashier_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenueToday = (txToday.data ?? []).reduce((s, t) => s + (t.total ?? 0), 0);
  const revenueMonth = (txMonth.data ?? []).reduce((s, t) => s + (t.total ?? 0), 0);

  return {
    revenueToday,
    revenueTodayFormatted: formatIDR(revenueToday),
    revenueMonth,
    revenueMonthFormatted: formatIDR(revenueMonth),
    transactionCountToday: txToday.data?.length ?? 0,
    lowStockProducts: lowStock.data ?? [],
    lowStockCount: lowStock.data?.length ?? 0,
    recentTransactions: recentTx.data ?? [],
  };
}

// ── Revenue Chart — 7 hari terakhir per unit bisnis ───────────
export async function fetchRevenueChart(days: number = 7) {
  const supabase = await createClient();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("transactions")
    .select(`
      completed_at,
      transaction_details (
        subtotal,
        products_services ( business_unit )
      )
    `)
    .eq("status", "completed")
    .gte("completed_at", from.toISOString());

  // Buat array tanggal 7 hari terakhir
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  // Aggregate per hari per unit bisnis
  const byDate: Record<string, { repair: number; wash: number; cafe: number }> = {};
  dates.forEach((d) => (byDate[d] = { repair: 0, wash: 0, cafe: 0 }));

  (data ?? []).forEach((tx: any) => {
    const date = tx.completed_at?.split("T")[0];
    if (!date || !byDate[date]) return;
    (tx.transaction_details ?? []).forEach((td: any) => {
      const unit = td.products_services?.business_unit;
      if (unit && byDate[date][unit as keyof typeof byDate[typeof date]] !== undefined) {
        byDate[date][unit as keyof typeof byDate[typeof date]] += td.subtotal ?? 0;
      }
    });
  });

  return dates.map((date) => ({
    date: new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    repair: byDate[date].repair,
    wash: byDate[date].wash,
    cafe: byDate[date].cafe,
    total: byDate[date].repair + byDate[date].wash + byDate[date].cafe,
  }));
}
