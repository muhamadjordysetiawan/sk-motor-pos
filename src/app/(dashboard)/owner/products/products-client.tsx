"use client";

import { useState, useTransition } from "react";
import {
  createProduct, updateProduct, toggleProductActive,
} from "@/app/actions/products";
import { formatIDR } from "@/lib/constants";
import {
  Plus, Search, Pencil, Power, X, Package, Wrench, Droplets, Coffee,
  ChevronDown, AlertTriangle,
} from "lucide-react";

const UNITS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  repair: { label: "Bengkel",  icon: Wrench,    color: "text-orange-400" },
  wash:   { label: "Steam",    icon: Droplets,  color: "text-cyan-400"   },
  cafe:   { label: "Cafe",     icon: Coffee,    color: "text-amber-400"  },
  general:{ label: "Umum",     icon: Package,   color: "text-gray-400"   },
};

function ProductModal({
  open, onClose, categories, editData,
}: {
  open: boolean;
  onClose: () => void;
  categories: any[];
  editData?: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"product" | "service">(editData?.type ?? "product");
  const [unit, setUnit] = useState(editData?.business_unit ?? "repair");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  if (!open) return null;

  const filteredCats = categories.filter((c: any) => c.business_unit === unit);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const payload = {
      ...data,
      type,
      business_unit: unit,
      is_active: true,
      price: Number(data.price),
      cost_price: Number(data.cost_price ?? 0),
      stock_qty: type === "product" ? Number(data.stock_qty ?? 0) : 0,
      low_stock_threshold: type === "product" ? Number(data.low_stock_threshold ?? 5) : 0,
      category_id: data.category_id || null,
    };

    startTransition(async () => {
      const res = editData
        ? await updateProduct(editData.id, payload)
        : await createProduct(payload);

      if (res?.error) {
        setErrors(res.error as Record<string, string[]>);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">
            {editData ? "Edit Produk/Layanan" : "Tambah Produk/Layanan"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors._form && (
            <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-red-300 text-sm">
              {errors._form.join(", ")}
            </div>
          )}

          {/* Tipe & Unit Bisnis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Tipe *</label>
              <div className="flex gap-2">
                {(["product","service"] as const).map((t) => (
                  <button key={t} type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      type === t
                        ? "border-blue-600 bg-blue-900/30 text-blue-300"
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}>
                    {t === "product" ? "Produk" : "Layanan/Jasa"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Unit Bisnis *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
              >
                {Object.entries(UNITS).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Kategori</label>
            <select
              name="category_id"
              defaultValue={editData?.category_id ?? ""}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Tanpa Kategori --</option>
              {filteredCats.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Nama & SKU */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nama *</label>
            <input
              name="name"
              required
              defaultValue={editData?.name}
              placeholder="Nama produk / layanan"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">SKU</label>
              <input
                name="sku"
                defaultValue={editData?.sku}
                placeholder="cth: OLI-END-01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Satuan</label>
              <input
                name="unit"
                defaultValue={editData?.unit ?? (type === "service" ? "servis" : "pcs")}
                placeholder="pcs, botol, porsi…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Harga Jual (Rp) *</label>
              <input
                type="number" name="price" required min={0}
                defaultValue={editData?.price ?? ""}
                placeholder="35000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Harga Modal (Rp)</label>
              <input
                type="number" name="cost_price" min={0}
                defaultValue={editData?.cost_price ?? ""}
                placeholder="28000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Stok (hanya untuk produk) */}
          {type === "product" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Stok Awal</label>
                <input
                  type="number" name="stock_qty" min={0}
                  defaultValue={editData?.stock_qty ?? 0}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Minimal Stok (Alert)</label>
                <input
                  type="number" name="low_stock_threshold" min={0}
                  defaultValue={editData?.low_stock_threshold ?? 5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors">
              {isPending ? "Menyimpan…" : editData ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductsClient({ initialProducts, categories }: {
  initialProducts: any[];
  categories: any[];
}) {
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = initialProducts.filter((p) => {
    if (filterUnit !== "all" && p.business_unit !== filterUnit) return false;
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterStatus === "active" && !p.is_active) return false;
    if (filterStatus === "inactive" && p.is_active) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function openEdit(product: any) {
    setEditData(product);
    setModalOpen(true);
  }

  function openAdd() {
    setEditData(null);
    setModalOpen(true);
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await toggleProductActive(id, !current); });
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Produk</h1>
          <p className="text-gray-400 text-sm mt-1">{initialProducts.length} total produk & layanan</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk…"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600"
          />
        </div>

        {[
          { label: "Unit Bisnis", value: filterUnit, setter: setFilterUnit, options: [
            { v:"all", l:"Semua Unit" },
            { v:"repair", l:"Bengkel" },
            { v:"wash", l:"Steam" },
            { v:"cafe", l:"Cafe" },
          ]},
          { label: "Tipe", value: filterType, setter: setFilterType, options: [
            { v:"all", l:"Semua Tipe" },
            { v:"product", l:"Produk" },
            { v:"service", l:"Layanan" },
          ]},
          { label: "Status", value: filterStatus, setter: setFilterStatus, options: [
            { v:"active", l:"Aktif" },
            { v:"inactive", l:"Nonaktif" },
            { v:"all", l:"Semua" },
          ]},
        ].map(({ label, value, setter, options }) => (
          <select key={label}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
          >
            {options.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-950/50">
                <th className="text-left px-4 py-3">Nama</th>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Tipe</th>
                <th className="text-right px-4 py-3">Harga</th>
                <th className="text-right px-4 py-3">Stok</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">Tidak ada produk ditemukan</td>
                </tr>
              ) : filtered.map((p) => {
                const unit = UNITS[p.business_unit] ?? UNITS.general;
                const UnitIcon = unit.icon;
                const isLowStock = p.type === "product" && p.stock_qty <= p.low_stock_threshold;
                return (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{p.name}</div>
                      {p.sku && <div className="text-gray-500 text-xs font-mono">{p.sku}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 ${unit.color}`}>
                        <UnitIcon className="w-3.5 h-3.5" />
                        <span className="text-xs">{unit.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.type === "product"
                          ? "bg-blue-900/40 text-blue-300"
                          : "bg-purple-900/40 text-purple-300"
                      }`}>
                        {p.type === "product" ? "Produk" : "Layanan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{formatIDR(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      {p.type === "product" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                          <span className={isLowStock ? "text-yellow-400 font-medium" : "text-gray-300"}>
                            {p.stock_qty} {p.unit}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.is_active
                          ? "bg-green-900/40 text-green-300"
                          : "bg-gray-800 text-gray-500"
                      }`}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggle(p.id, p.is_active)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_active
                              ? "hover:bg-red-900/30 text-gray-400 hover:text-red-400"
                              : "hover:bg-green-900/30 text-gray-400 hover:text-green-400"
                          }`}>
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        categories={categories}
        editData={editData}
      />
    </div>
  );
}
