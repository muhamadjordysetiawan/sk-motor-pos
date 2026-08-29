"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendWhatsAppReceipt(transactionId: string) {
  try {
    const supabase = await createClient();

    // 1. Ambil data transaksi
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles!cashier_id ( full_name ),
        vehicles ( license_plate, owner_name, vehicle_type ),
        transaction_details (
          qty, unit_price, discount, subtotal, notes,
          products_services ( name, unit, business_unit ),
          profiles!assigned_staff_id ( full_name )
        )
      `)
      .eq("id", transactionId)
      .single();

    if (txError || !tx) return { error: "Transaksi tidak ditemukan" };
    if (!tx.wa_phone) return { error: "Nomor WA pelanggan tidak ada" };

    return await sendReceiptViaFonnte(tx);
  } catch (error: any) {
    return { error: error.message || "Gagal mengirim struk" };
  }
}

export async function sendReceiptViaFonnte(tx: any) {
  // 1. Ambil settings dari LocalStorage tidak bisa di server component.
  // Tapi karena ini server action, kita perlu parameter config
  return { error: "Fonnte API di-handle di Client Component karena butuh local storage" };
}
