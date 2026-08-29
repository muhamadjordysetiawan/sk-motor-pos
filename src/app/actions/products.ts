"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Schemas ───────────────────────────────────────────────────
const ProductSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  sku: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["product", "service"]),
  business_unit: z.enum(["repair", "wash", "cafe", "general"]),
  category_id: z.string().uuid().optional().nullable(),
  price: z.coerce.number().min(0),
  cost_price: z.coerce.number().min(0).optional(),
  stock_qty: z.coerce.number().int().min(0).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
  is_active: z.boolean().optional(),
});

const StaffSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(["mechanic", "washer", "waiter", "cashier"]),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
});

// ── Fetch Products ────────────────────────────────────────────
export async function fetchProducts(filters?: {
  business_unit?: string;
  type?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products_services")
    .select("*, categories(name, business_unit)")
    .order("business_unit")
    .order("name");

  if (filters?.business_unit) query = query.eq("business_unit", filters.business_unit as any);
  if (filters?.type) query = query.eq("type", filters.type as any);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch Categories ──────────────────────────────────────────
export async function fetchCategories(business_unit?: string) {
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").order("sort_order");
  if (business_unit) query = query.eq("business_unit", business_unit as any);
  const { data } = await query;
  return data ?? [];
}

// ── Create Product ────────────────────────────────────────────
export async function createProduct(formData: unknown) {
  const supabase = await createClient();
  const parsed = ProductSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const payload = {
    ...parsed.data,
    stock_qty: parsed.data.type === "service" ? 0 : (parsed.data.stock_qty ?? 0),
    low_stock_threshold: parsed.data.type === "service" ? 0 : (parsed.data.low_stock_threshold ?? 5),
  };

  const { error } = await supabase.from("products_services").insert(payload);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/owner/products");
  return { success: true };
}

// ── Update Product ────────────────────────────────────────────
export async function updateProduct(id: string, formData: unknown) {
  const supabase = await createClient();
  const parsed = ProductSchema.partial().safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("products_services")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/owner/products");
  return { success: true };
}

// ── Toggle Product Active ─────────────────────────────────────
export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products_services")
    .update({ is_active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/owner/products");
  return { success: true };
}

// ── Fetch Staff ───────────────────────────────────────────────
export async function fetchStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("role")
    .order("full_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Create Staff (tanpa Auth — hanya insert ke profiles) ──────
export async function createStaff(formData: unknown) {
  const supabase = await createClient();
  const parsed = StaffSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // Staff non-login: insert manual ke profiles dengan UUID baru
  const { error } = await supabase.from("profiles").insert({
    id: crypto.randomUUID(),
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    phone: parsed.data.phone ?? null,
    is_active: parsed.data.is_active ?? true,
  });
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/owner/staff");
  return { success: true };
}

// ── Update Staff ──────────────────────────────────────────────
export async function updateStaff(id: string, formData: unknown) {
  const supabase = await createClient();
  const parsed = StaffSchema.partial().safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/owner/staff");
  return { success: true };
}

// ── Toggle Staff Active ───────────────────────────────────────
export async function toggleStaffActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/owner/staff");
  return { success: true };
}
