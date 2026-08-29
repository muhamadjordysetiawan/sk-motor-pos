import { fetchDashboardStats, fetchRevenueChart } from "@/app/actions/dashboard";
import { formatIDR } from "@/lib/constants";
import { OwnerDashboardClient } from "./dashboard-client";
import {
  TrendingUp, ShoppingCart, AlertTriangle, Calendar,
  Wrench, Droplets, Coffee,
} from "lucide-react";

export const metadata = { title: "Dashboard Owner" };

const UNIT_COLOR: Record<string, string> = {
  repair: "text-orange-400",
  wash: "text-cyan-400",
  cafe: "text-amber-400",
};

const UNIT_ICON: Record<string, React.ElementType> = {
  repair: Wrench,
  wash: Droplets,
  cafe: Coffee,
};

export default async function OwnerDashboardPage() {
  const [stats, chartData] = await Promise.all([
    fetchDashboardStats(),
    fetchRevenueChart(7),
  ]);

  const kpiCards = [
    {
      label: "Pendapatan Hari Ini",
      value: stats.revenueTodayFormatted,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-900/20",
      border: "border-green-800/30",
    },
    {
      label: "Transaksi Hari Ini",
      value: stats.transactionCountToday.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
      border: "border-blue-800/30",
    },
    {
      label: "Stok Menipis",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "text-red-400" : "text-gray-400",
      bg: stats.lowStockCount > 0 ? "bg-red-900/20" : "bg-gray-800/20",
      border: stats.lowStockCount > 0 ? "border-red-800/30" : "border-gray-700/30",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: stats.revenueMonthFormatted,
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-900/20",
      border: "border-purple-800/30",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Owner</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`p-5 rounded-2xl border ${border} ${bg} flex items-center gap-4`}>
            <div className={`p-3 rounded-xl bg-gray-900/50`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">Pendapatan 7 Hari Terakhir</h2>
              <p className="text-gray-400 text-xs mt-1">Per unit bisnis</p>
            </div>
            <div className="flex gap-3">
              {["repair","wash","cafe"].map((u) => {
                const Icon = UNIT_ICON[u];
                return (
                  <div key={u} className={`flex items-center gap-1 text-xs ${UNIT_COLOR[u]}`}>
                    <Icon className="w-3 h-3" />
                    <span className="capitalize">{u === "repair" ? "Bengkel" : u === "wash" ? "Steam" : "Cafe"}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <OwnerDashboardClient chartData={chartData} />
        </div>

        {/* Low Stock Alert */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-white font-semibold text-sm">Stok Menipis</h2>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Semua stok aman ✓</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div>
                    <p className="text-white text-xs font-medium">{p.name}</p>
                    <p className={`text-xs capitalize ${UNIT_COLOR[p.business_unit]}`}>
                      {p.business_unit === "repair" ? "Bengkel" : p.business_unit === "wash" ? "Steam" : "Cafe"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.stock_qty === 0
                        ? "bg-red-900/50 text-red-300"
                        : "bg-yellow-900/50 text-yellow-300"
                    }`}>
                      {p.stock_qty} {p.unit}
                    </span>
                    <p className="text-gray-500 text-xs mt-1">min: {p.low_stock_threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Transaksi Terkini</h2>
        {stats.recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Belum ada transaksi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left pb-3">Invoice</th>
                  <th className="text-left pb-3">Kasir</th>
                  <th className="text-left pb-3">Waktu</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stats.recentTransactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="py-3 text-blue-400 font-mono text-xs">{tx.invoice_number ?? "DRAFT"}</td>
                    <td className="py-3 text-gray-300">{tx.profiles?.full_name ?? "-"}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(tx.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "completed" ? "bg-green-900/50 text-green-300" :
                        tx.status === "voided"    ? "bg-red-900/50 text-red-300" :
                                                    "bg-gray-800 text-gray-400"
                      }`}>
                        {tx.status === "completed" ? "Selesai" : tx.status === "voided" ? "Void" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 text-right text-white font-medium">
                      {formatIDR(tx.total ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
