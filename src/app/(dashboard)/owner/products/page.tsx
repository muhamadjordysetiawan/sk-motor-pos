import { fetchProducts, fetchCategories } from "@/app/actions/products";
import { ProductsClient } from "./products-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Manajemen Produk" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.user_metadata.role !== "owner" && user.user_metadata.role !== "cashier")) {
    redirect("/login");
  }

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  return <ProductsClient initialProducts={products} categories={categories} />;
}
