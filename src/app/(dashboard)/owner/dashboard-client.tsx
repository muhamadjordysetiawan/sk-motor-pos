"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatIDR } from "@/lib/constants";

interface ChartEntry {
  date: string;
  repair: number;
  wash: number;
  cafe: number;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-300 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">
            {p.dataKey === "repair" ? "Bengkel" : p.dataKey === "wash" ? "Steam" : "Cafe"}:
          </span>
          <span className="text-white font-medium">{formatIDR(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between">
        <span className="text-gray-400">Total:</span>
        <span className="text-white font-bold">{formatIDR(payload.reduce((s: number, p: any) => s + p.value, 0))}</span>
      </div>
    </div>
  );
};

export function OwnerDashboardClient({ chartData }: { chartData: ChartEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradRepair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#fb923c" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradWash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCafe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v.toString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="repair" stroke="#fb923c" fill="url(#gradRepair)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="wash"   stroke="#22d3ee" fill="url(#gradWash)"   strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="cafe"   stroke="#fbbf24" fill="url(#gradCafe)"   strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
