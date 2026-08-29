import { fetchRevenueSummary, fetchReportTransactions, fetchExpenses } from "@/app/actions/reports";
import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export const metadata = { title: "Laporan Keuangan — SK Motor" };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function monthStartStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = todayStr();
  const monthStart = monthStartStr();

  const [summary, transactions, expenses] = await Promise.all([
    fetchRevenueSummary(monthStart, today),
    fetchReportTransactions({ start_date: monthStart, end_date: today }),
    fetchExpenses(monthStart, today),
  ]);

  return (
    <ReportsClient
      initialSummary={summary}
      initialTransactions={transactions as any[]}
      initialExpenses={expenses as any[]}
      defaultStartDate={monthStart}
      defaultEndDate={today}
      ownerId={user?.id ?? ""}
    />
  );
}
