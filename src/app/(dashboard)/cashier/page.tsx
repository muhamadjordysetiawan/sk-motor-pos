import { fetchPOSProducts, fetchActiveStaff } from "@/app/actions/pos";
import { createClient } from "@/lib/supabase/server";
import { POSClient } from "./pos-client";

export const metadata = { title: "POS Kasir — SK Motor" };

export default async function CashierPOSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [products, staff] = await Promise.all([
    fetchPOSProducts(),
    fetchActiveStaff(),
  ]);

  return (
    <POSClient
      products={products}
      staff={staff}
      cashierId={user?.id ?? ""}
      cashierName={user?.user_metadata?.full_name ?? user?.email ?? ""}
    />
  );
}
