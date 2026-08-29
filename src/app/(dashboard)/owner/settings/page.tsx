"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Store, Phone, MapPin, Key, Wifi, Save,
  CheckCircle2, Eye, EyeOff, Info, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_SETTINGS = {
  business_name: "SK Motor",
  business_address: "",
  business_phone: "",
  business_tagline: "Bengkel · Steam · Cafe",
  wa_api_key: "",     // Fonnte API key
  wa_sender: "",      // Nomor WA pengirim (Fonnte)
  receipt_footer: "Terima kasih atas kunjungan Anda!",
};

function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sk_motor_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  function save(data: typeof DEFAULT_SETTINGS) {
    localStorage.setItem("sk_motor_settings", JSON.stringify(data));
    setSettings(data);
  }

  return { settings, save };
}

// ── Section Card ────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-800">
        <Icon className="w-4 h-4 text-blue-400" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-400 text-xs mb-1 block">{label}</label>
      {children}
      {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, save } = useSettings();
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  function set(key: keyof typeof DEFAULT_SETTINGS, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    save(form);
    setSaved(true);
    toast.success("Pengaturan disimpan!");
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleChangePassword() {
    if (newPass !== confirmPass) { toast.error("Konfirmasi password tidak cocok!"); return; }
    if (newPass.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    setPassLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) toast.error(error.message);
    else {
      toast.success("Password berhasil diubah!");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    }
    setPassLoading(false);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-gray-400 text-sm mt-1">Konfigurasi toko dan integrasi</p>
      </div>

      {/* ── Profil Bisnis ─────────────────────────────────── */}
      <Section title="Profil Bisnis" icon={Store}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama Toko">
              <input value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
            </Field>
            <Field label="Tagline">
              <input value={form.business_tagline}
                onChange={(e) => set("business_tagline", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
            </Field>
          </div>
          <Field label="Alamat">
            <input value={form.business_address}
              onChange={(e) => set("business_address", e.target.value)}
              placeholder="Jl. Contoh No. 1, Kota"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </Field>
          <Field label="No. HP / WA Toko">
            <input value={form.business_phone}
              onChange={(e) => set("business_phone", e.target.value)}
              placeholder="628xxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </Field>
          <Field label="Footer Struk">
            <input value={form.receipt_footer}
              onChange={(e) => set("receipt_footer", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-600" />
          </Field>
        </div>
      </Section>

      {/* ── WhatsApp API ───────────────────────────────────── */}
      <Section title="Integrasi WhatsApp (Fonnte)" icon={MessageCircle}>
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-blue-300 text-xs space-y-1">
                <p>Gunakan <strong>Fonnte</strong> untuk kirim struk otomatis ke WhatsApp pelanggan.</p>
                <p>Daftar di <strong className="text-blue-200">fonnte.com</strong> → ambil API Key → isi di bawah.</p>
                <p className="text-blue-400">Tanpa API key, struk tetap bisa dikirim manual via link WA.</p>
              </div>
            </div>
          </div>

          <Field label="Fonnte API Key" hint="Dari dashboard fonnte.com → Device → Token">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={form.wa_api_key}
                onChange={(e) => set("wa_api_key", e.target.value)}
                placeholder="Paste API key di sini…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Nomor WA Pengirim" hint="Format: 628xxxxxxxxxx (no +, no spasi). Harus terdaftar di Fonnte.">
            <input
              value={form.wa_sender}
              onChange={(e) => set("wa_sender", e.target.value)}
              placeholder="628123456789"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600"
            />
          </Field>

          {form.wa_api_key && (
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>API Key terisi — struk akan otomatis terkirim ke WA pelanggan</span>
            </div>
          )}
        </div>
      </Section>

      {/* ── Ganti Password ─────────────────────────────────── */}
      <Section title="Ganti Password" icon={Key}>
        <div className="space-y-4">
          <Field label="Password Baru">
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
              placeholder="Min. 6 karakter"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-600" />
          </Field>
          <button onClick={handleChangePassword} disabled={passLoading || !newPass || !confirmPass}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 rounded-xl text-white text-sm font-medium">
            {passLoading ? "Menyimpan…" : "Ubah Password"}
          </button>
        </div>
      </Section>

      {/* ── Info Aplikasi ─────────────────────────────────── */}
      <Section title="Info Aplikasi" icon={Info}>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between"><span>Versi</span><span className="text-white">1.0.0</span></div>
          <div className="flex justify-between"><span>Framework</span><span className="text-white">Next.js 16.3.3</span></div>
          <div className="flex justify-between"><span>Database</span><span className="text-white">Supabase PostgreSQL</span></div>
          <div className="flex justify-between"><span>Unit Bisnis</span><span className="text-white">Bengkel · Steam · Cafe</span></div>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-colors ${
            saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          }`}>
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Tersimpan!" : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}
