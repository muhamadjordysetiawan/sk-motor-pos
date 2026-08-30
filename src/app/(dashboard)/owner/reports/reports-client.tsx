"use client";

import { useState, useTransition } from "react";
import {
  fetchReportTransactions,
  fetchRevenueSummary,
  fetchExpenses,
  voidTransactionAction,
  createExpense,
} from "@/app/actions/reports";
import { formatIDR } from "@/lib/constants";
import {
  TrendingUp, Wrench, Droplets, Coffee, ReceiptText,
  ChevronDown, ChevronUp, X, AlertTriangle, Plus,
  ArrowDownCircle, ArrowUpCircle, Scale, Tag
} from "lucide-react";
import { toast } from "sonner";

// ─── Void Modal ──────────────────────────────────────────────
function VoidModal({
  tx, onClose, onConfirm, isPending,
}: {
  tx: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-white font-semibold text-sm">Void Transaksi</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-800/60 rounded-xl p-3">
            <div className="text-blue-400 font-mono text-sm">{tx.invoice_number}</div>
            <div className="text-white font-bold">{formatIDR(tx.total)}</div>
            <div className="text-gray-400 text-xs">{tx.vehicles?.license_plate ?? "—"} · {tx.profiles?.full_name}</div>
          </div>
          <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-3 text-red-300 text-xs">
            ⚠️ Void akan <strong>mengembalikan stok</strong> produk. Tindakan ini tidak bisa dibatalkan.
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Alasan Void *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Tuliskan alasan void transaksi ini…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-600 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-lg text-gray-300 text-sm">
              Batal
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={!reason.trim() || isPending}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg text-white text-sm font-medium">
              {isPending ? "Memproses…" : "Void Transaksi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Expense Modal ───────────────────────────────────────────
function ExpenseModal({
  open, onClose, ownerId,
}: {
  open: boolean;
  onClose: () => void;
  ownerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      business_unit: fd.get("business_unit") as string,
      category: fd.get("category") as string,
      description: fd.get("description") as string,
      amount: Number(fd.get("amount")),
      expense_date: fd.get("expense_date") as string,
      notes: fd.get("notes") as string,
      recorded_by: ownerId,
    };

    startTransition(async () => {
      const res = await createExpense(payload);
      if (res?.error) setError(res.error);
      else { toast.success("Pengeluaran dicatat!"); onClose(); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-white font-semibold text-sm">Catat Pengeluaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-red-300 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Unit Bisnis</label>
              <select name="business_unit" required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
                <option value="repair">Bengkel</option>
                <option value="wash">Steam</option>
                <option value="cafe">Cafe</option>
                <option value="general">Umum</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Tanggal</label>
              <input type="date" name="expense_date" required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Kategori</label>
            <input name="category" required placeholder="cth: Bahan Baku, Gaji, Listrik"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Deskripsi *</label>
            <input name="description" required placeholder="Keterangan pengeluaran"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Jumlah (Rp) *</label>
            <input type="number" name="amount" required min={1} placeholder="150000"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Catatan</label>
            <input name="notes" placeholder="Opsional"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-lg text-gray-300 text-sm">Batal</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium">
              {isPending ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Transaction Detail Row ──────────────────────────────────
function TxRow({ tx, onVoid }: { tx: any; onVoid: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const details = tx.transaction_details ?? [];
  const byUnit: Record<string, number> = {};
  details.forEach((d: any) => {
    const u = d.products_services?.business_unit ?? "general";
    byUnit[u] = (byUnit[u] ?? 0) + (d.subtotal ?? 0);
  });

  const UNIT_COLOR: Record<string, string> = {
    repair: "text-orange-400", wash: "text-cyan-400", cafe: "text-amber-400", general: "text-gray-400",
  };
  const UNIT_LABEL: Record<string, string> = {
    repair: "Bengkel", wash: "Steam", cafe: "Cafe", general: "Umum",
  };

  return (
    <>
      <tr className="hover:bg-gray-800/30 transition-colors">
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-blue-400 font-mono text-xs hover:text-blue-300">
            {tx.invoice_number ?? "DRAFT"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </td>
        <td className="px-4 py-3 text-gray-300 text-xs">
          {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          <div className="text-gray-600">
            {new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300 text-xs">
          <div>{tx.vehicles?.license_plate ?? "—"}</div>
          <div className="text-gray-500">{tx.vehicles?.owner_name ?? ""}</div>
        </td>
        <td className="px-4 py-3 text-gray-400 text-xs">{tx.profiles?.full_name ?? "—"}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap">
            {Object.entries(byUnit).map(([u, v]) => (
              <span key={u} className={`text-xs px-1.5 py-0.5 rounded bg-gray-800 ${UNIT_COLOR[u]}`}>
                {UNIT_LABEL[u]}
              </span>
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-right text-white font-medium text-sm">{formatIDR(tx.total)}</td>
        <td className="px-4 py-3 text-center">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            tx.status === "completed" ? "bg-green-900/40 text-green-300" :
            tx.status === "voided"    ? "bg-red-900/40 text-red-300"    :
                                        "bg-gray-800 text-gray-400"
          }`}>
            {tx.status === "completed" ? "Selesai" : tx.status === "voided" ? "Void" : "Draft"}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {tx.status === "completed" && (
            <button onClick={onVoid}
              className="text-xs px-2 py-1 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors">
              Void
            </button>
          )}
          {tx.status === "voided" && tx.void_reason && (
            <span className="text-xs text-gray-600 italic">{tx.void_reason.substring(0, 20)}…</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-800/20">
          <td colSpan={8} className="px-4 py-3">
            <div className="space-y-1">
              {details.map((d: any, i: number) => (
                <div key={i} className="flex justify-between text-xs text-gray-400">
                  <span className={UNIT_COLOR[d.products_services?.business_unit ?? "general"]}>
                    {d.qty}x {d.products_services?.name}
                    {d.discount > 0 ? ` (diskon ${formatIDR(d.discount)})` : ""}
                  </span>
                  <span className="text-gray-300">{formatIDR(d.subtotal)}</span>
                </div>
              ))}
              {tx.discount > 0 && (
                <div className="flex justify-between text-xs pt-1 border-t border-gray-700">
                  <span className="text-red-400">Diskon Transaksi</span>
                  <span className="text-red-400">-{formatIDR(tx.discount)}</span>
                </div>
              )}
              {tx.payment_method && (
                <div className="text-xs text-gray-600 pt-1">
                  Bayar via {tx.payment_method.toUpperCase()}
                  {tx.payment_method === "cash" && tx.change_amount > 0
                    ? ` · Kembalian ${formatIDR(tx.change_amount)}`
                    : ""}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Reports Client ─────────────────────────────────────
export function ReportsClient({
  initialSummary, initialTransactions, initialExpenses,
  defaultStartDate, defaultEndDate, ownerId,
}: {
  initialSummary: { repair: number; wash: number; cafe: number; total: number; count: number };
  initialTransactions: any[];
  initialExpenses: any[];
  defaultStartDate: string;
  defaultEndDate: string;
  ownerId: string;
}) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [activeTab, setActiveTab] = useState<"transactions" | "expenses">("transactions");

  const [summary, setSummary] = useState(initialSummary);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [expenses, setExpenses] = useState(initialExpenses);

  const [voidTx, setVoidTx] = useState<any>(null);
  const [expenseModal, setExpenseModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  async function handleFilter() {
    setIsLoading(true);
    const [newSummary, newTx, newExp] = await Promise.all([
      fetchRevenueSummary(startDate, endDate),
      fetchReportTransactions({ start_date: startDate, end_date: endDate, status: filterStatus, business_unit: filterUnit }),
      fetchExpenses(startDate, endDate),
    ]);
    setSummary(newSummary);
    setTransactions(newTx as any[]);
    setExpenses(newExp as any[]);
    setIsLoading(false);
  }

  function handleVoid(reason: string) {
    if (!voidTx) return;
    startTransition(async () => {
      const res = await voidTransactionAction(voidTx.id, reason, ownerId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Transaksi berhasil di-void");
        setTransactions((prev) =>
          prev.map((t) => t.id === voidTx.id ? { ...t, status: "voided", void_reason: reason } : t)
        );
        setVoidTx(null);
      }
    });
  }

  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const labaKotor = summary.total - totalExpenses;

  const filteredTx = transactions.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterUnit !== "all") {
      return (t.transaction_details ?? []).some(
        (d: any) => d.products_services?.business_unit === filterUnit
      );
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-gray-400 text-sm mt-1">Ringkasan pemasukan dan pengeluaran</p>
        </div>
        <button onClick={() => setExpenseModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Catat Pengeluaran
        </button>
      </div>

      {/* Filter */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-gray-500 text-xs mb-1 block">Dari Tanggal</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
        </div>
        <div>
          <label className="text-gray-500 text-xs mb-1 block">Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
        </div>
        <div>
          <label className="text-gray-500 text-xs mb-1 block">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
            <option value="all">Semua</option>
            <option value="completed">Selesai</option>
            <option value="voided">Void</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="text-gray-500 text-xs mb-1 block">Unit Bisnis</label>
          <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
            <option value="all">Semua Unit</option>
            <option value="repair">Bengkel</option>
            <option value="wash">Steam</option>
            <option value="cafe">Cafe</option>
          </select>
        </div>
        <button onClick={handleFilter} disabled={isLoading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium">
          {isLoading ? "Memuat…" : "Tampilkan"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {[
          { label: "Pemasukan Bersih", value: summary.total, icon: ArrowUpCircle, color: "text-green-400", bg: "bg-green-900/20", border: "border-green-800/30" },
          { label: "Laba Kotor", value: labaKotor, icon: Scale, color: labaKotor >= 0 ? "text-purple-400" : "text-red-400", bg: labaKotor >= 0 ? "bg-purple-900/20" : "bg-red-900/20", border: labaKotor >= 0 ? "border-purple-800/30" : "border-red-800/30" },
          { label: "Diskon Transaksi", value: summary.discount, icon: Tag, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-800/30" },
          { label: "Total Pengeluaran", value: totalExpenses, icon: ArrowDownCircle, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-800/30" },
          { label: "Gross Bengkel", value: summary.repair, icon: Wrench, color: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-800/30" },
          { label: "Gross Steam", value: summary.wash, icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-900/20", border: "border-cyan-800/30" },
          { label: "Gross Cafe", value: summary.cafe, icon: Coffee, color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-800/30" },
          { label: "Transaksi", value: summary.count, icon: ReceiptText, color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-800/30", isFormat: false },
        ].map(({ label, value, icon: Icon, color, bg, border, isFormat = true }) => (
          <div key={label} className={`p-4 rounded-2xl border ${border} ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
            <div className={`text-base font-bold ${color}`}>{isFormat ? formatIDR(value) : value}</div>
          </div>
        ))}
      </div>

      {/* Jumlah transaksi */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <ReceiptText className="w-4 h-4" />
        <span>{summary.count} transaksi selesai · {filteredTx.length} ditampilkan</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {[
          { key: "transactions", label: `Transaksi (${filteredTx.length})` },
          { key: "expenses", label: `Pengeluaran (${expenses.length})` },
        ].map(({ key, label }) => (
          <button key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      {activeTab === "transactions" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-950/50">
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Tanggal</th>
                  <th className="text-left px-4 py-3">Kendaraan</th>
                  <th className="text-left px-4 py-3">Kasir</th>
                  <th className="text-left px-4 py-3">Unit</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      Tidak ada transaksi dalam rentang waktu ini
                    </td>
                  </tr>
                ) : filteredTx.map((tx) => (
                  <TxRow key={tx.id} tx={tx} onVoid={() => setVoidTx(tx)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      {activeTab === "expenses" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-950/50">
                  <th className="text-left px-4 py-3">Tanggal</th>
                  <th className="text-left px-4 py-3">Unit</th>
                  <th className="text-left px-4 py-3">Kategori</th>
                  <th className="text-left px-4 py-3">Deskripsi</th>
                  <th className="text-left px-4 py-3">Dicatat oleh</th>
                  <th className="text-right px-4 py-3">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Belum ada pengeluaran dicatat
                    </td>
                  </tr>
                ) : expenses.map((e: any) => {
                  const UNIT_COLOR: Record<string, string> = {
                    repair: "text-orange-400", wash: "text-cyan-400", cafe: "text-amber-400", general: "text-gray-400",
                  };
                  const UNIT_LABEL: Record<string, string> = {
                    repair: "Bengkel", wash: "Steam", cafe: "Cafe", general: "Umum",
                  };
                  return (
                    <tr key={e.id} className="hover:bg-gray-800/20">
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(e.expense_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${UNIT_COLOR[e.business_unit]}`}>{UNIT_LABEL[e.business_unit]}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{e.category}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">
                        {e.description}
                        {e.notes && <div className="text-gray-600">{e.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{e.profiles?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-red-400 font-medium">-{formatIDR(e.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
              {expenses.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-700 bg-gray-800/30">
                    <td colSpan={5} className="px-4 py-3 text-right text-gray-400 text-xs font-medium">Total Pengeluaran</td>
                    <td className="px-4 py-3 text-right text-red-400 font-bold">-{formatIDR(totalExpenses)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidTx && (
        <VoidModal
          tx={voidTx}
          onClose={() => setVoidTx(null)}
          onConfirm={handleVoid}
          isPending={isPending}
        />
      )}

      {/* Expense Modal */}
      <ExpenseModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        ownerId={ownerId}
      />
    </div>
  );
}
