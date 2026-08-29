// ==================================================
// SK Motor POS — App-wide constants
// ==================================================

export const APP_NAME = "SK Motor" as const;
export const APP_TAGLINE = "Bengkel · Steam · Cafe" as const;

// ── Roles ──────────────────────────────────────────
export const ROLES = {
  OWNER: "owner",
  CASHIER: "cashier",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ── Business Units ─────────────────────────────────
export const BUSINESS_UNITS = {
  REPAIR: "repair",
  WASH: "wash",
  CAFE: "cafe",
} as const;

export type BusinessUnit =
  (typeof BUSINESS_UNITS)[keyof typeof BUSINESS_UNITS];

export const BUSINESS_UNIT_LABELS: Record<BusinessUnit, string> = {
  repair: "Bengkel (Repair)",
  wash: "Steam Car Wash",
  cafe: "Cafe",
};

// ── Currency ───────────────────────────────────────
export const CURRENCY = "IDR" as const;

/**
 * Format a number as Indonesian Rupiah.
 * e.g. formatIDR(150000) → "Rp 150.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Routes ─────────────────────────────────────────
export const ROUTES = {
  LOGIN: "/login",
  OWNER_DASHBOARD: "/owner",
  CASHIER_POS: "/cashier",
} as const;
