"use client";

import { useState, useTransition } from "react";
import { createStaff, updateStaff, toggleStaffActive } from "@/app/actions/products";
import { Plus, X, Pencil, Power, Wrench, Droplets, Coffee, ShieldCheck, User } from "lucide-react";

const ROLES: Record<string, { label: string; icon: React.ElementType; color: string; desc: string }> = {
  owner:    { label: "Owner",    icon: ShieldCheck, color: "text-purple-400", desc: "Akses penuh, bisa login" },
  cashier:  { label: "Kasir",   icon: User,        color: "text-blue-400",   desc: "Input transaksi, bisa login" },
  mechanic: { label: "Mekanik", icon: Wrench,      color: "text-orange-400", desc: "Bengkel, tanpa akun login" },
  washer:   { label: "Cuci",    icon: Droplets,    color: "text-cyan-400",   desc: "Steam, tanpa akun login" },
  waiter:   { label: "Pelayan", icon: Coffee,      color: "text-amber-400",  desc: "Cafe, tanpa akun login" },
};

function StaffModal({ open, onClose, editData }: { open: boolean; onClose: () => void; editData?: any }) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<string>(editData?.role ?? "mechanic");
  const [error, setError] = useState<string>("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { full_name: fd.get("full_name") as string, role, phone: fd.get("phone") as string };

    startTransition(async () => {
      const res = editData
        ? await updateStaff(editData.id, data)
        : await createStaff(data);

      if (res?.error) {
        const errs = res.error as any;
        setError(errs._form?.[0] ?? errs.full_name?.[0] ?? "Terjadi kesalahan");
      } else {
        onClose();
      }
    });
  }

  const nonLoginRoles = ["mechanic", "washer", "waiter"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{editData ? "Edit Staff" : "Tambah Staff"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-red-300 text-sm">{error}</div>
          )}

          {/* Role Selector */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Role *</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(ROLES)
                .filter(([r]) => !editData || r !== "owner") // sembunyikan owner saat tambah
                .filter(([r]) => editData || r !== "owner")  // sembunyikan owner saat tambah
                .filter(([r]) => r !== "owner" && r !== "cashier" || !!editData) // baru: hanya tampil mechanic/washer/waiter
                .map(([r, info]) => {
                  const Icon = info.icon;
                  return (
                    <button key={r} type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        role === r
                          ? "border-blue-600 bg-blue-900/20"
                          : "border-gray-700 hover:border-gray-600"
                      }`}>
                      <Icon className={`w-4 h-4 ${info.color}`} />
                      <div>
                        <div className="text-white text-sm font-medium">{info.label}</div>
                        <div className="text-gray-500 text-xs">{info.desc}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {nonLoginRoles.includes(role) && (
            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg px-3 py-2 text-yellow-300 text-xs">
              ⓘ Staff ini <strong>tidak perlu akun login</strong> — hanya sebagai referensi di POS saat assign servis.
            </div>
          )}

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nama Lengkap *</label>
            <input
              name="full_name"
              required
              defaultValue={editData?.full_name}
              placeholder="cth: Budi Santoso"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">No. HP</label>
            <input
              name="phone"
              defaultValue={editData?.phone}
              placeholder="08xxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600">
              Batal
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium">
              {isPending ? "Menyimpan…" : editData ? "Simpan" : "Tambah Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StaffClient({ initialStaff }: { initialStaff: any[] }) {
  const [filterRole, setFilterRole] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = initialStaff.filter((s) =>
    filterRole === "all" ? true : s.role === filterRole
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Staff</h1>
          <p className="text-gray-400 text-sm mt-1">{initialStaff.length} total staff terdaftar</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah Staff
        </button>
      </div>

      {/* Info box */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400">
        <strong className="text-white">Catatan:</strong> Hanya <span className="text-purple-400">Owner</span> dan{" "}
        <span className="text-blue-400">Kasir</span> yang punya akun login. Mekanik, karyawan cuci, dan pelayan cafe
        hanya sebagai referensi assignment di POS — tidak bisa login ke sistem.
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ v: "all", l: "Semua" }, ...Object.entries(ROLES).map(([v, {label: l}]) => ({ v, l }))].map(({ v, l }) => (
          <button key={v}
            onClick={() => setFilterRole(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterRole === v
                ? "bg-blue-600 text-white"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700"
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">Tidak ada staff ditemukan</div>
        ) : filtered.map((s) => {
          const roleInfo = ROLES[s.role];
          const Icon = roleInfo?.icon ?? User;
          const canLogin = s.role === "owner" || s.role === "cashier";
          return (
            <div key={s.id}
              className={`bg-gray-900 border rounded-2xl p-4 transition-colors ${
                s.is_active ? "border-gray-800" : "border-gray-800/50 opacity-60"
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gray-800`}>
                  <Icon className={`w-5 h-5 ${roleInfo?.color ?? "text-gray-400"}`} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditData(s); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startTransition(async () => { await toggleStaffActive(s.id, !s.is_active); })}
                    disabled={isPending || s.role === "owner"}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                      s.is_active
                        ? "hover:bg-red-900/30 text-gray-500 hover:text-red-400"
                        : "hover:bg-green-900/30 text-gray-500 hover:text-green-400"
                    }`}>
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="font-semibold text-white text-sm">{s.full_name}</div>
              <div className={`text-xs mt-0.5 ${roleInfo?.color ?? "text-gray-400"}`}>{roleInfo?.label ?? s.role}</div>
              {s.phone && <div className="text-gray-500 text-xs mt-1">{s.phone}</div>}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.is_active ? "bg-green-900/40 text-green-300" : "bg-gray-800 text-gray-500"
                }`}>
                  {s.is_active ? "Aktif" : "Nonaktif"}
                </span>
                {canLogin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400">
                    Bisa login
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <StaffModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        editData={editData}
      />
    </div>
  );
}
