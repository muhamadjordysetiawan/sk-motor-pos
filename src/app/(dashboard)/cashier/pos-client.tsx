"use client";

import { useState, useTransition, useRef } from "react";
import { useCartStore, CartItem } from "@/stores/cart-store";
import { submitTransaction } from "@/app/actions/pos";
import { searchVehicle } from "@/app/actions/vehicles";
import { formatIDR } from "@/lib/constants";
import {
  Search, ShoppingCart, Trash2, Plus, Minus, X, Car, Bike, Truck,
  Wrench, Droplets, Coffee, Package, CheckCircle2, Printer,
  ChevronDown, UserCheck, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────
const TABS = [
  { key: "all",    label: "Semua",   icon: Package,  color: "text-gray-400" },
  { key: "repair", label: "Bengkel", icon: Wrench,   color: "text-orange-400" },
  { key: "wash",   label: "Steam",   icon: Droplets, color: "text-cyan-400"   },
  { key: "cafe",   label: "Cafe",    icon: Coffee,   color: "text-amber-400"  },
];

const PAYMENT_METHODS = [
  { key: "cash",     label: "Tunai" },
  { key: "transfer", label: "Transfer" },
  { key: "qris",     label: "QRIS" },
  { key: "piutang",  label: "Piutang" },
] as const;

const VEHICLE_ICONS: Record<string, React.ElementType> = {
  motor: Bike, mobil: Car, truk: Truck, lainnya: Package,
};

// ── Receipt Modal ─────────────────────────────────────────────
function ReceiptModal({ tx, onClose }: { tx: any; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML ?? "";
    const w = window.open("", "_blank");
    w?.document.write(`
      <html><head><title>Struk SK Motor</title>
      <style>
        body { font-family: monospace; font-size: 12px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 4px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .total-row { font-size: 14px; font-weight: bold; }
      </style></head>
      <body>${content}</body></html>
    `);
    w?.document.close();
    w?.print();
  }

  const details = tx.transaction_details ?? [];
  const vehicle = tx.vehicles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white text-black rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header modal */}
        <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-white font-semibold text-sm">Transaksi Berhasil!</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Receipt content */}
        <div ref={printRef} className="p-5 font-mono text-xs">
          <div className="text-center mb-3">
            <div className="text-base font-bold">SK MOTOR</div>
            <div className="text-gray-600">Bengkel · Steam · Cafe</div>
            <div className="border-t border-dashed border-gray-300 mt-2 pt-2">
              <div className="font-bold">{tx.invoice_number}</div>
              <div className="text-gray-500">
                {new Date(tx.completed_at ?? tx.created_at).toLocaleString("id-ID", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
              <div className="text-gray-500">Kasir: {tx.profiles?.full_name}</div>
            </div>
          </div>

          {vehicle && (
            <div className="border-t border-dashed border-gray-300 py-2 mb-2">
              <div className="font-bold">{vehicle.license_plate}</div>
              <div className="text-gray-600">{vehicle.owner_name}</div>
              {vehicle.vehicle_type && (
                <div className="text-gray-500 text-[10px] uppercase">
                  {vehicle.vehicle_type} 
                  {vehicle.brand ? ` - ${vehicle.brand}` : ""}
                  {vehicle.model ? ` ${vehicle.model}` : ""}
                  {vehicle.color ? ` (${vehicle.color})` : ""}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 pt-2 mb-2 space-y-1">
            {details.map((d: any, i: number) => (
              <div key={i}>
                <div className="font-medium">{d.products_services?.name}</div>
                <div className="flex justify-between text-gray-600">
                  <span>{d.qty}x {formatIDR(d.unit_price)}{d.discount > 0 ? ` (-${formatIDR(d.discount)})` : ""}</span>
                  <span>{formatIDR(d.subtotal)}</span>
                </div>
                {d.profiles?.full_name && (
                  <div className="text-gray-400 text-xs">↳ {d.profiles.full_name}</div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span><span>{formatIDR(tx.subtotal)}</span>
            </div>
            {tx.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon</span><span>-{formatIDR(tx.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1 mt-1">
              <span>TOTAL</span><span>{formatIDR(tx.total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Bayar ({tx.payment_method?.toUpperCase()})</span>
              <span>{formatIDR(tx.amount_paid ?? tx.total)}</span>
            </div>
            {tx.payment_method === "cash" && tx.change_amount > 0 && (
              <div className="flex justify-between font-bold">
                <span>Kembalian</span><span>{formatIDR(tx.change_amount)}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-3 text-gray-400 text-xs border-t border-dashed border-gray-300 pt-2">
            Terima kasih atas kunjungan Anda!
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">
            Tutup
          </button>
          <button onClick={handlePrint}
            className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl text-white text-sm flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print Struk
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Vehicle Modal ─────────────────────────────────────────
function AddVehicleModal({
  open, onClose, onSelect
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (vehicle: any) => void;
}) {
  const [isPending, startTransition] = useTransition();

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
      // Create vehicle dan dapatkan return record dari database
      const { createVehicle } = await import("@/app/actions/vehicles");
      const res = await createVehicle(data);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.data) {
        toast.success("Kendaraan berhasil didaftarkan");
        onSelect(res.data);
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
            <label className="text-gray-400 text-xs mb-1 block">No. HP (Opsional)</label>
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

// ── Checkout Modal ────────────────────────────────────────────
function CheckoutModal({
  open, onClose, total, subtotal, discount, onConfirm, isPending,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  discount: number;
  onConfirm: (method: string, amountPaid: number, globalDiscount: number) => void;
  isPending: boolean;
}) {
  const [method, setMethod] = useState<"cash"|"transfer"|"qris"|"piutang">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(discount.toString());

  if (!open) return null;

  const finalTotal = Math.max(0, subtotal - Number(globalDiscount || 0));
  const paid = Number(amountPaid || 0);
  const change = Math.max(0, paid - finalTotal);
  const kurang = finalTotal - paid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-white font-semibold">Checkout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span><span className="text-white">{formatIDR(subtotal)}</span>
            </div>
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Diskon Transaksi</span>
              </div>
              <input
                type="number" min={0} max={subtotal}
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-600"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-700 pt-2">
              <span className="text-gray-300">TOTAL</span>
              <span className="text-green-400">{formatIDR(finalTotal)}</span>
            </div>
          </div>

          {/* Metode Bayar */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Metode Pembayaran</label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(({ key, label }) => (
                <button key={key} type="button"
                  onClick={() => setMethod(key)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    method === key
                      ? "border-blue-600 bg-blue-900/30 text-blue-300"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah Bayar (hanya untuk cash) */}
          {method === "cash" && (
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Jumlah Uang Diterima</label>
              <input
                type="number" min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={finalTotal.toString()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-blue-600"
              />
              {/* Quick amounts */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[finalTotal, 50000, 100000, 200000, 500000].filter((v) => v >= finalTotal || v === finalTotal).map((v) => (
                  <button key={v} type="button"
                    onClick={() => setAmountPaid(v.toString())}
                    className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:border-gray-500">
                    {formatIDR(v)}
                  </button>
                ))}
              </div>
              {paid > 0 && paid >= finalTotal && (
                <div className="mt-2 bg-green-900/20 border border-green-800/40 rounded-lg px-3 py-2 flex justify-between">
                  <span className="text-green-300 text-sm">Kembalian</span>
                  <span className="text-green-300 font-bold">{formatIDR(change)}</span>
                </div>
              )}
              {paid > 0 && paid < finalTotal && (
                <div className="mt-2 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2 flex justify-between">
                  <span className="text-red-300 text-sm">Kurang</span>
                  <span className="text-red-300 font-bold">{formatIDR(kurang)}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => onConfirm(method, method === "cash" ? paid : finalTotal, Number(globalDiscount || 0))}
            disabled={isPending || (method === "cash" && paid < finalTotal)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white font-bold text-sm transition-colors">
            {isPending ? "Memproses…" : `✓ Bayar ${formatIDR(finalTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main POS Client ───────────────────────────────────────────
export function POSClient({ products, staff, cashierId, cashierName }: {
  products: any[];
  staff: any[];
  cashierId: string;
  cashierName: string;
}) {
  const cart = useCartStore();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // Vehicle search
  const [plateSearch, setPlateSearch] = useState("");
  const [vehicleResults, setVehicleResults] = useState<any[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Staff assign modal
  const [staffModal, setStaffModal] = useState<{ itemId: string; name: string } | null>(null);

  // Add vehicle modal
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  // Filter produk
  const filteredProducts = products.filter((p) => {
    if (activeTab !== "all" && p.business_unit !== activeTab) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleVehicleSearch() {
    if (!plateSearch.trim()) return;
    setVehicleLoading(true);
    const res = await searchVehicle(plateSearch);
    setVehicleResults(res.data ?? []);
    setVehicleLoading(false);
  }

  async function sendFonnteReceipt(tx: any, targetWa: string) {
    try {
      const saved = localStorage.getItem("sk_motor_settings");
      if (!saved) return;
      const settings = JSON.parse(saved);
      if (!settings.wa_api_key) return;

      const details = tx.transaction_details ?? [];
      let itemsText = "";
      details.forEach((d: any) => {
        itemsText += `- ${d.qty}x ${d.products_services?.name}\n`;
        itemsText += `  ${formatIDR(d.unit_price)} = ${formatIDR(d.subtotal)}\n`;
      });

      const message = `*SK MOTOR - BENGKEL, STEAM, CAFE*\n${settings.business_address}\n\n`
        + `Halo kak${tx.vehicles?.owner_name ? ` *${tx.vehicles.owner_name}*` : ""}, ini bukti transaksi kamu:\n\n`
        + `*No Invoice:* ${tx.invoice_number}\n`
        + `*Tanggal:* ${new Date(tx.completed_at).toLocaleString("id-ID")}\n`
        + (tx.vehicles ? `*Kendaraan:* ${tx.vehicles.license_plate}\n` : "")
        + `-----------------------------------\n`
        + itemsText
        + `-----------------------------------\n`
        + `*Subtotal:* ${formatIDR(tx.subtotal)}\n`
        + (tx.discount > 0 ? `*Diskon:* -${formatIDR(tx.discount)}\n` : "")
        + `*TOTAL:* ${formatIDR(tx.total)}\n`
        + `*Bayar (${tx.payment_method?.toUpperCase()}):* ${formatIDR(tx.amount_paid)}\n`
        + (tx.payment_method === "cash" && tx.change_amount > 0 ? `*Kembalian:* ${formatIDR(tx.change_amount)}\n` : "")
        + `\n${settings.receipt_footer || "Terima kasih atas kunjungan Anda!"}`;

      await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": settings.wa_api_key,
        },
        body: new URLSearchParams({
          target: targetWa,
          message: message,
          countryCode: "62", // Default to Indonesia
        }),
      });
      toast.success("E-Receipt berhasil dikirim ke WhatsApp!");
    } catch (e) {
      console.error("Gagal kirim WA", e);
      toast.error("Gagal mengirim WA E-Receipt");
    }
  }

  function handlePayClick() {
    setCheckoutOpen(true);
  }

  function handleConfirmCheckout(method: string, amountPaid: number, globalDiscount: number) {
    cart.setGlobalDiscount(globalDiscount);

    startTransition(async () => {
      const res = await submitTransaction({
        vehicle_id: cart.vehicle?.id ?? null,
        cashier_id: cashierId,
        payment_method: method as any,
        discount: globalDiscount,
        tax: cart.tax,
        notes: cart.notes,
        wa_phone: cart.wa_phone,
        amount_paid: amountPaid,
        items: cart.items.map((i) => ({
          product_id: i.id,
          qty: i.qty,
          unit_price: i.unit_price,
          discount: i.discount,
          subtotal: i.subtotal,
          assigned_staff_id: i.assigned_staff_id,
          notes: i.notes,
        })),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        setCheckoutOpen(false);
        setReceipt(res.data);
        cart.clearCart();
        setPlateSearch("");
        setVehicleResults([]);
        toast.success("Transaksi berhasil! 🎉");
        
        // Kirim struk WA jika ada nomor
        if (res.data?.wa_phone) {
          sendFonnteReceipt(res.data, res.data.wa_phone);
        }
      }
    });
  }

  const unitColor: Record<string, string> = {
    repair: "text-orange-400", wash: "text-cyan-400", cafe: "text-amber-400", general: "text-gray-400",
  };

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* ── PANEL KIRI: Produk ───────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">
        {/* Header kasir */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-sm">POS Kasir</h1>
            <p className="text-gray-500 text-xs">{cashierName}</p>
          </div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk atau layanan…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Tabs unit bisnis */}
        <div className="flex border-b border-gray-800 px-2">
          {TABS.map(({ key, label, icon: Icon, color }) => (
            <button key={key}
              onClick={() => { setActiveTab(key); setSearch(""); }}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? `border-blue-500 ${color}`
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">Tidak ada produk</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {filteredProducts.map((p) => {
                const inCart = cart.items.find((i) => i.id === p.id);
                const outOfStock = p.type === "product" && p.stock_qty <= 0;
                return (
                  <button key={p.id}
                    onClick={() => !outOfStock && cart.addItem({
                      id: p.id, name: p.name, type: p.type,
                      business_unit: p.business_unit, price: p.price, unit: p.unit ?? "pcs",
                    })}
                    disabled={outOfStock}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      outOfStock
                        ? "border-gray-800 opacity-40 cursor-not-allowed"
                        : inCart
                          ? "border-blue-600 bg-blue-900/20 shadow-lg shadow-blue-900/20"
                          : "border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 active:scale-95"
                    }`}>
                    {inCart && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {inCart.qty}
                      </span>
                    )}
                    <div className={`text-xs mb-1 ${unitColor[p.business_unit]}`}>
                      {p.business_unit === "repair" ? "Bengkel" : p.business_unit === "wash" ? "Steam" : p.business_unit === "cafe" ? "Cafe" : "Umum"}
                    </div>
                    <div className="text-white text-xs font-medium leading-tight line-clamp-2">{p.name}</div>
                    <div className="text-green-400 font-bold text-sm mt-1.5">{formatIDR(p.price)}</div>
                    {p.type === "product" && (
                      <div className={`text-xs mt-0.5 ${p.stock_qty <= p.low_stock_threshold ? "text-yellow-500" : "text-gray-600"}`}>
                        stok: {p.stock_qty} {p.unit}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── PANEL KANAN: Cart ────────────────────────────── */}
      <div className="w-80 xl:w-96 flex flex-col bg-gray-900">
        {/* Vehicle selector */}
        <div className="p-3 border-b border-gray-800">
          {cart.vehicle ? (
            <div className="flex items-center justify-between bg-blue-900/20 border border-blue-800/40 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-white text-xs font-bold font-mono">{cart.vehicle.license_plate}</div>
                  <div className="text-gray-400 text-xs">{cart.vehicle.owner_name}</div>
                </div>
              </div>
              <button onClick={() => cart.setVehicle(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Pilih Kendaraan</span>
                <button onClick={() => setAddVehicleOpen(true)} className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Baru
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  value={plateSearch}
                  onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleVehicleSearch()}
                  placeholder="Nomor polisi (opsional)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-2 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
              <button onClick={handleVehicleSearch} disabled={vehicleLoading}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white">
                {vehicleLoading ? "…" : "Cari"}
              </button>
            </div>
          </div>
          )}
          {vehicleResults.length > 0 && !cart.vehicle && (
            <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              {vehicleResults.map((v) => {
                const Icon = VEHICLE_ICONS[v.vehicle_type] ?? Car;
                return (
                  <button key={v.id}
                    onClick={() => { cart.setVehicle(v); setVehicleResults([]); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 text-left border-b border-gray-700 last:border-0">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div className="text-white text-xs font-mono font-bold">{v.license_plate}</div>
                      <div className="text-gray-400 text-xs">{v.owner_name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Cart masih kosong</p>
              <p className="text-xs mt-1">Klik produk untuk menambahkan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  staff={staff}
                  onQtyChange={(qty) => cart.updateQty(item.id, qty)}
                  onRemove={() => cart.removeItem(item.id)}
                  onDiscountChange={(d) => cart.updateDiscount(item.id, d)}
                  onAssignStaff={(id, name) => cart.assignStaff(item.id, id, name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* WA Input */}
        {cart.items.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 bg-gray-900">
            <input
              type="text"
              placeholder="No. WA Pelanggan (08... / 628...)"
              value={cart.wa_phone}
              onChange={(e) => cart.setWaPhone(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-green-600"
            />
          </div>
        )}

        {/* Cart footer */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-gray-800 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>{cart.items.reduce((s, i) => s + i.qty, 0)} item</span>
                <span>{formatIDR(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Diskon</span>
                  <span>-{formatIDR(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-gray-800">
                <span>TOTAL</span>
                <span className="text-green-400">{formatIDR(cart.total || cart.subtotal)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => cart.clearCart()}
                className="p-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-900/50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={handlePayClick}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Bayar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={cart.total || cart.subtotal}
        subtotal={cart.subtotal}
        discount={cart.discount}
        onConfirm={handleConfirmCheckout}
        isPending={isPending}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        onSelect={(vehicle) => {
          cart.setVehicle(vehicle);
          setPlateSearch("");
          setVehicleResults([]);
        }}
      />

      {/* Receipt Modal */}
      {receipt && (
        <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

// ── Cart Item Row ─────────────────────────────────────────────
function CartItemRow({ item, staff, onQtyChange, onRemove, onDiscountChange, onAssignStaff }: {
  item: CartItem;
  staff: any[];
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  onDiscountChange: (d: number) => void;
  onAssignStaff: (id: string | null, name: string | null) => void;
}) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showStaff, setShowStaff] = useState(false);

  const relevantStaff = staff.filter((s) => {
    if (item.business_unit === "repair") return s.role === "mechanic";
    if (item.business_unit === "wash") return s.role === "washer";
    if (item.business_unit === "cafe") return s.role === "waiter";
    return true;
  });

  const unitColor: Record<string, string> = {
    repair: "text-orange-400", wash: "text-cyan-400", cafe: "text-amber-400", general: "text-gray-400",
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className={`text-xs ${unitColor[item.business_unit]}`}>
            {item.business_unit === "repair" ? "Bengkel" : item.business_unit === "wash" ? "Steam" : item.business_unit === "cafe" ? "Cafe" : "Umum"}
          </div>
          <div className="text-white text-xs font-medium leading-tight">{item.name}</div>
          <div className="text-gray-400 text-xs">{formatIDR(item.unit_price)}/{item.unit}</div>
        </div>

        {/* Qty controls */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => onQtyChange(item.qty - 1)}
            className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700">
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-white text-sm font-bold w-5 text-center">{item.qty}</span>
          <button onClick={() => onQtyChange(item.qty + 1)}
            className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button onClick={onRemove} className="text-gray-600 hover:text-red-400 ml-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtotal + actions */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-2">
          {/* Diskon */}
          <button onClick={() => setShowDiscount(!showDiscount)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              item.discount > 0
                ? "border-red-800/50 text-red-300 bg-red-900/20"
                : "border-gray-700 text-gray-500 hover:border-gray-600"
            }`}>
            {item.discount > 0 ? `-${formatIDR(item.discount)}` : "Diskon"}
          </button>

          {/* Assign staff */}
          {item.type === "service" && relevantStaff.length > 0 && (
            <div className="flex items-center">
              <UserCheck className={`w-3 h-3 mr-1 ${item.assigned_staff_id ? 'text-green-400' : 'text-gray-500'}`} />
              <select
                value={item.assigned_staff_id || ""}
                onChange={(e) => {
                  const staffId = e.target.value;
                  if (!staffId) {
                    onAssignStaff(null, null);
                  } else {
                    const selected = relevantStaff.find(s => s.id === staffId);
                    if (selected) onAssignStaff(selected.id, selected.full_name);
                  }
                }}
                className={`text-xs bg-transparent focus:outline-none appearance-none cursor-pointer border-b border-dashed ${
                  item.assigned_staff_id ? 'text-green-300 border-green-800/50' : 'text-gray-500 border-gray-600'
                }`}
              >
                <option value="" className="bg-gray-900 text-gray-500">— Pilih Karyawan</option>
                {relevantStaff.map((s) => (
                  <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <span className="text-white font-bold text-sm">{formatIDR(item.subtotal)}</span>
      </div>

      {/* Discount input */}
      {showDiscount && (
        <div className="mt-2">
          <input
            type="number" min={0} max={item.unit_price}
            defaultValue={item.discount || ""}
            placeholder="Jumlah diskon (Rp)"
            onBlur={(e) => { onDiscountChange(Number(e.target.value || 0)); setShowDiscount(false); }}
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-600"
          />
        </div>
      )}
    </div>
  );
}
