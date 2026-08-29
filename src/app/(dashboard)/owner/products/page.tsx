import { fetchProducts, fetchCategories } from "@/app/actions/products";
import { ProductsClient } from "./products-client";

export const metadata = { title: "Manajemen Produk" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  return <ProductsClient initialProducts={products} categories={categories} />;
}
