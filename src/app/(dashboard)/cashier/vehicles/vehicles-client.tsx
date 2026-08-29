"use client";

import { useState, useTransition, useEffect } from "react";
import { searchVehicle, fetchVehicleHistory, createVehicle } from "@/app/actions/vehicles";
import { formatIDR } from "@/lib/constants";
import { Search, Plus, X, Car, Bike, Truck, Package, ChevronRight, Clock, AlertCircle } from "lucide-react";

const VEHICLE_ICONS: Record<string, React.ElementType> = {
  motor: Bike, mobil: Car, truk: Truck, lainnya: Package,
};
const VEHICLE_LABELS: Record<string, string> = {
  motor: "Motor", mobil: "Mobil", truk: "Truk", lainnya: "Lainnya",
};

function VehicleModal({ open, onClose, onRefresh }: { open: boolean; onClose: () => void; onRefresh: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      license_plate: fd.get("license_plate") as string,
      vehicle_type: fd.get("vehicle_type") as any,
      owner_name: fd.get("owner_name") as string,
      phone: fd.get("phone") as string,
      brand: fd.get("brand") as string,
      model: fd.get("model") as string,
      color: fd.get("color") as string,
    };
    
    startTransition(async () => {
      const res = await createVehicle(data);
      if (res?.error) {
        setError(res.error);
      } else {
        onRefresh();
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">Daftarkan Kendaraan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nomor Polisi *</label>
            <input name="license_plate" required placeholder="AB 1234 CD"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm uppercase placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Jenis Kendaraan *</label>
            <select name="vehicle_type" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600">
              <option value="motor">Motor</option>
              <option value="mobil">Mobil</option>
              <option value="truk">Truk</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nama Pemilik *</label>
            <input name="owner_name" required placeholder="Nama pelanggan"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">No. HP</label>
            <input name="phone" placeholder="08xxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["brand","model","color"].map((f) => (
              <div key={f}>
                <label className="text-gray-400 text-xs mb-1 block capitalize">
                  {f === "brand" ? "Merek" : f === "model" ? "Model" : "Warna"}
                </label>
                <input name={f} placeholder={f === "brand" ? "Honda" : f === "model" ? "Beat" : "Putih"}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-lg text-gray-300 text-sm">Batal</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium">
              {isPending ? "Menyimpan…" : "Daftarkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehiclesClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load semua kendaraan saat komponen di-mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const res = await searchVehicle(""); // parameter kosong untuk ambil semua
    setResults(res.data ?? []);
    setLoading(false);
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setSelected(null);
    setHistory([]);
    
    // Kalau query kosong, ambil semua
    const res = await searchVehicle(query.trim());
    setResults(res.data ?? []);
    setLoading(false);
  }

  async function selectVehicle(v: any) {
    setSelected(v);
    setHistLoading(true);
    const res = await fetchVehicleHistory(v.license_plate);
    setHistory(res.data ?? []);
    setHistLoading(false);
  }

  const VIcon = VEHICLE_ICONS[selected?.vehicle_type] ?? Car;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Database Kendaraan</h1>
          <p className="text-gray-400 text-sm mt-1">Cari kendaraan & riwayat servis</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Daftarkan Kendaraan
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Cari nomor polisi… cth: AB 1234 CD"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>
        <button type="submit" disabled={loading}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white text-sm font-medium">
          {loading ? "Mencari…" : "Cari"}
        </button>
      </form>

      {/* Hasil pencarian / List lengkap */}
      {!selected && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 text-xs text-gray-500">
            {results.length > 0 ? `${results.length} kendaraan ditemukan` : (loading ? "Memuat..." : "Belum ada kendaraan yang terdaftar")}
          </div>
          {results.length > 0 && results.map((v) => {
            const Icon = VEHICLE_ICONS[v.vehicle_type] ?? Car;
            return (
              <button key={v.id} onClick={() => selectVehicle(v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/40 border-b border-gray-800/50 last:border-0 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-gray-800">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-mono font-semibold">{v.license_plate}</div>
                    <div className="text-gray-400 text-sm">{v.owner_name} · {v.brand} {v.model}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            );
          })}
        </div>
      )}

      {/* Detail kendaraan + riwayat */}
      {selected && (
        <div className="space-y-4">
          {/* Header kendaraan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-blue-900/30 rounded-xl">
              <VIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-white text-xl font-bold font-mono">{selected.license_plate}</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full">
                  {VEHICLE_LABELS[selected.vehicle_type]}
                </span>
              </div>
              <p className="text-gray-300 mt-1">{selected.owner_name}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                {selected.brand && <span>{selected.brand} {selected.model}</span>}
                {selected.color && <span>· {selected.color}</span>}
                {selected.phone && <span>· {selected.phone}</span>}
              </div>
            </div>
            <button onClick={() => { setSelected(null); setResults([]); }}
              className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* Riwayat servis */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-white font-medium text-sm">Riwayat Servis</h3>
            </div>

            {histLoading ? (
              <div className="text-center py-10 text-gray-500 text-sm">Memuat riwayat…</div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">Belum ada riwayat servis</div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {history.map((tx: any) => (
                  <div key={tx.transaction_id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-blue-400 font-mono text-xs">{tx.invoice_number}</span>
                        <span className="ml-3 text-gray-500 text-xs">
                          {new Date(tx.transaction_date).toLocaleDateString("id-ID", {
                            day:"numeric", month:"short", year:"numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">{formatIDR(tx.total)}</div>
                        <span className={`text-xs ${tx.status === "voided" ? "text-red-400" : "text-green-400"}`}>
                          {tx.status === "voided" ? "Void" : "Selesai"}
                        </span>
                      </div>
                    </div>
                    {(tx.items ?? []).length > 0 && (
                      <div className="space-y-1">
                        {tx.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs text-gray-400">
                            <span>{item.qty}x {item.name}{item.staff ? ` (${item.staff})` : ""}</span>
                            <span>{formatIDR(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-600">Kasir: {tx.cashier_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <VehicleModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onRefresh={() => handleSearch(true)} 
      />
    </div>
  );
}
