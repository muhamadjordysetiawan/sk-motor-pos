"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit2, CreditCard, Award } from "lucide-react";
import { createMember, updateMember } from "@/app/actions/members";
import { toast } from "sonner";

function MemberModal({ open, onClose, editData }: any) {
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let res;
      if (editData) {
        res = await updateMember(editData.id, formData);
      } else {
        res = await createMember(formData);
      }
      
      if (res.error) toast.error(res.error);
      else {
        toast.success("Member berhasil disimpan!");
        onClose();
      }
    });
  }

  const defaultCode = editData?.member_code || `SKM-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-white font-bold mb-4">{editData ? "Edit Member" : "Tambah Member Baru"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nomor Kartu (Barcode ID) *</label>
            <input name="member_code" readOnly={!!editData} defaultValue={defaultCode} required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-600" />
            {!editData && <p className="text-[10px] text-gray-500 mt-1">ID dibuat otomatis, bisa diubah jika mencetak kartu fisik sendiri.</p>}
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nama Lengkap *</label>
            <input name="full_name" defaultValue={editData?.full_name} required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nomor WhatsApp / HP</label>
            <input name="phone" defaultValue={editData?.phone}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Total Poin Saat Ini</label>
            <input name="points" type="number" min={0} defaultValue={editData?.points || 0} required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-600" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm hover:border-gray-500">
              Batal
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MembersClient({ initialMembers }: { initialMembers: any[] }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filtered = initialMembers.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) || 
    m.member_code.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone && m.phone.includes(search))
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, nama, atau no WA..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600"
          />
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Member
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor Kartu</th>
                <th className="px-4 py-3 font-medium">Nama Member</th>
                <th className="px-4 py-3 font-medium">Poin</th>
                <th className="px-4 py-3 font-medium">Tgl Daftar</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono text-blue-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" /> {m.member_code}
                  </td>
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{m.full_name}</div>
                    <div className="text-gray-500 text-xs">{m.phone || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Award className="w-4 h-4" /> {m.points}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditData(m); setModalOpen(true); }}
                      className="p-1.5 text-gray-500 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MemberModal open={modalOpen} onClose={() => setModalOpen(false)} editData={editData} />
    </>
  );
}
