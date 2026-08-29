/**
 * SK Motor POS — Supabase Database Types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "cashier" | "mechanic" | "washer" | "waiter";
export type BusinessUnit = "repair" | "wash" | "cafe" | "general";
export type ProductType = "product" | "service";
export type VehicleType = "motor" | "mobil" | "truk" | "lainnya";
export type TransactionStatus = "draft" | "completed" | "voided";
export type PaymentMethod = "cash" | "transfer" | "qris" | "piutang";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          business_unit: BusinessUnit;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_unit: BusinessUnit;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_unit?: BusinessUnit;
          icon?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      products_services: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          sku: string | null;
          description: string | null;
          type: ProductType;
          business_unit: BusinessUnit;
          price: number;
          cost_price: number | null;
          stock_qty: number;
          low_stock_threshold: number;
          unit: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          sku?: string | null;
          description?: string | null;
          type: ProductType;
          business_unit: BusinessUnit;
          price?: number;
          cost_price?: number | null;
          stock_qty?: number;
          low_stock_threshold?: number;
          unit?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          sku?: string | null;
          description?: string | null;
          type?: ProductType;
          business_unit?: BusinessUnit;
          price?: number;
          cost_price?: number | null;
          stock_qty?: number;
          low_stock_threshold?: number;
          unit?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "products_services_category_id_fkey"; columns: ["category_id"]; referencedRelation: "categories"; referencedColumns: ["id"]; }
        ];
      };
      vehicles: {
        Row: {
          id: string;
          license_plate: string;
          owner_name: string;
          phone: string | null;
          vehicle_type: VehicleType;
          brand: string | null;
          model: string | null;
          color: string | null;
          year: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          license_plate: string;
          owner_name: string;
          phone?: string | null;
          vehicle_type: VehicleType;
          brand?: string | null;
          model?: string | null;
          color?: string | null;
          year?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          license_plate?: string;
          owner_name?: string;
          phone?: string | null;
          vehicle_type?: VehicleType;
          brand?: string | null;
          model?: string | null;
          color?: string | null;
          year?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          invoice_number: string | null;
          vehicle_id: string | null;
          cashier_id: string;
          status: TransactionStatus;
          payment_method: PaymentMethod | null;
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          amount_paid: number | null;
          change_amount: number | null;
          notes: string | null;
          wa_phone: string | null;
          voided_by: string | null;
          void_reason: string | null;
          created_at: string;
          completed_at: string | null;
          voided_at: string | null;
        };
        Insert: {
          id?: string;
          invoice_number?: string | null;
          vehicle_id?: string | null;
          cashier_id: string;
          status?: TransactionStatus;
          payment_method?: PaymentMethod | null;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          amount_paid?: number | null;
          change_amount?: number | null;
          notes?: string | null;
          wa_phone?: string | null;
          voided_by?: string | null;
          void_reason?: string | null;
          created_at?: string;
          completed_at?: string | null;
          voided_at?: string | null;
        };
        Update: {
          id?: string;
          invoice_number?: string | null;
          vehicle_id?: string | null;
          cashier_id?: string;
          status?: TransactionStatus;
          payment_method?: PaymentMethod | null;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          amount_paid?: number | null;
          change_amount?: number | null;
          notes?: string | null;
          wa_phone?: string | null;
          voided_by?: string | null;
          void_reason?: string | null;
          completed_at?: string | null;
          voided_at?: string | null;
        };
        Relationships: [];
      };
      transaction_details: {
        Row: {
          id: string;
          transaction_id: string;
          product_id: string;
          assigned_staff_id: string | null;
          qty: number;
          unit_price: number;
          discount: number;
          subtotal: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          product_id: string;
          assigned_staff_id?: string | null;
          qty?: number;
          unit_price?: number;
          discount?: number;
          subtotal?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          product_id?: string;
          assigned_staff_id?: string | null;
          qty?: number;
          unit_price?: number;
          discount?: number;
          subtotal?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          transaction_id: string | null;
          qty_change: number;
          stock_after: number;
          reason: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          transaction_id?: string | null;
          qty_change: number;
          stock_after: number;
          reason: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          reason?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          recorded_by: string;
          business_unit: BusinessUnit;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          receipt_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recorded_by: string;
          business_unit: BusinessUnit;
          category: string;
          description: string;
          amount: number;
          expense_date?: string;
          receipt_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          business_unit?: BusinessUnit;
          category?: string;
          description?: string;
          amount?: number;
          expense_date?: string;
          receipt_url?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_vehicle_history: {
        Args: { p_license_plate: string };
        Returns: {
          transaction_id: string;
          invoice_number: string;
          transaction_date: string;
          status: TransactionStatus;
          total: number;
          cashier_name: string;
          items: Json;
        }[];
      };
      get_revenue_summary: {
        Args: { p_start_date?: string; p_end_date?: string; p_unit?: string | null };
        Returns: {
          business_unit: string;
          total_revenue: number;
          total_transactions: number;
          total_items: number;
        }[];
      };
      get_staff_commission: {
        Args: { p_staff_id: string; p_start_date?: string; p_end_date?: string };
        Returns: {
          product_name: string;
          business_unit: string;
          total_qty: number;
          total_revenue: number;
          assigned_date: string;
        }[];
      };
      is_owner: { Args: Record<string, never>; Returns: boolean };
      is_cashier_or_above: { Args: Record<string, never>; Returns: boolean };
      get_my_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
