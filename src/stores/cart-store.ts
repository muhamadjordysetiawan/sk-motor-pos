import { create } from "zustand";
import { formatIDR } from "@/lib/constants";

// ── Types ───────────────────────────────────────────────────────
export interface CartItem {
  id: string;           // product_id
  name: string;
  type: "product" | "service";
  business_unit: string;
  unit_price: number;
  qty: number;
  discount: number;     // discount per item (bukan persen)
  subtotal: number;
  unit: string;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  notes: string;
}

export interface CartVehicle {
  id: string;
  license_plate: string;
  owner_name: string;
  vehicle_type: string;
}

interface CartState {
  items: CartItem[];
  vehicle: CartVehicle | null;
  discount: number;     // diskon global transaksi
  tax: number;          // pajak (0 by default)
  notes: string;
  wa_phone: string;

  // Computed
  subtotal: number;
  total: number;

  // Actions
  addItem: (product: {
    id: string;
    name: string;
    type: "product" | "service";
    business_unit: string;
    price: number;
    unit: string;
  }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  assignStaff: (productId: string, staffId: string | null, staffName: string | null) => void;
  setVehicle: (vehicle: CartVehicle | null) => void;
  setGlobalDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  setWaPhone: (phone: string) => void;
  clearCart: () => void;
}

function calcSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.subtotal, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  vehicle: null,
  discount: 0,
  tax: 0,
  notes: "",
  wa_phone: "",
  subtotal: 0,
  total: 0,

  addItem(product) {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = state.items.map((i) =>
          i.id === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.unit_price - i.discount) * (i.qty + 1) }
            : i
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          type: product.type,
          business_unit: product.business_unit,
          unit_price: product.price,
          qty: 1,
          discount: 0,
          subtotal: product.price,
          unit: product.unit,
          assigned_staff_id: null,
          assigned_staff_name: null,
          notes: "",
        };
        newItems = [...state.items, newItem];
      }

      const subtotal = calcSubtotal(newItems);
      const total = Math.max(0, subtotal - state.discount + state.tax);
      return { items: newItems, subtotal, total };
    });
  },

  removeItem(productId) {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== productId);
      const subtotal = calcSubtotal(newItems);
      const total = Math.max(0, subtotal - state.discount + state.tax);
      return { items: newItems, subtotal, total };
    });
  },

  updateQty(productId, qty) {
    if (qty < 1) return;
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === productId
          ? { ...i, qty, subtotal: (i.unit_price - i.discount) * qty }
          : i
      );
      const subtotal = calcSubtotal(newItems);
      const total = Math.max(0, subtotal - state.discount + state.tax);
      return { items: newItems, subtotal, total };
    });
  },

  updateDiscount(productId, discount) {
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === productId
          ? { ...i, discount, subtotal: (i.unit_price - discount) * i.qty }
          : i
      );
      const subtotal = calcSubtotal(newItems);
      const total = Math.max(0, subtotal - state.discount + state.tax);
      return { items: newItems, subtotal, total };
    });
  },

  updateNotes(productId, notes) {
    set((state) => ({
      items: state.items.map((i) => (i.id === productId ? { ...i, notes } : i)),
    }));
  },

  assignStaff(productId, staffId, staffName) {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId
          ? { ...i, assigned_staff_id: staffId, assigned_staff_name: staffName }
          : i
      ),
    }));
  },

  setVehicle(vehicle) {
    set({ vehicle });
  },

  setGlobalDiscount(discount) {
    set((state) => {
      const total = Math.max(0, state.subtotal - discount + state.tax);
      return { discount, total };
    });
  },

  setNotes(notes) { set({ notes }); },
  setWaPhone(wa_phone) { set({ wa_phone }); },

  clearCart() {
    set({ items: [], vehicle: null, discount: 0, tax: 0, notes: "", wa_phone: "", subtotal: 0, total: 0 });
  },
}));
