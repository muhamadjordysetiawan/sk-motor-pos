"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Car,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
  Droplets,
  Coffee,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_TAGLINE, ROLES } from "@/lib/constants";
import { toast } from "sonner";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  // Semua akses
  {
    href: "/owner",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.OWNER, ROLES.CASHIER],
  },
  {
    href: "/owner/reports",
    label: "Laporan Keuangan",
    icon: BarChart3,
    roles: [ROLES.OWNER, ROLES.CASHIER],
  },
  {
    href: "/owner/products",
    label: "Master Produk",
    icon: Package,
    roles: [ROLES.OWNER, ROLES.CASHIER],
  },
  {
    href: "/owner/staff",
    label: "Staff & Mekanik",
    icon: Users,
    roles: [ROLES.OWNER], // HANYA OWNER
  },
  {
    href: "/owner/settings",
    label: "Pengaturan",
    icon: Settings,
    roles: [ROLES.OWNER, ROLES.CASHIER],
  },
  // Cashier (also visible to owner)
  {
    href: "/cashier",
    label: "POS Kasir",
    icon: ShoppingCart,
    roles: [ROLES.OWNER, ROLES.CASHIER],
    badge: "POS",
  },
  {
    href: "/cashier/vehicles",
    label: "Database Kendaraan",
    icon: Car,
    roles: [ROLES.OWNER, ROLES.CASHIER],
  },
  {
    href: "/cashier/inventory",
    label: "Stok Tersedia",
    icon: Package,
    roles: [ROLES.CASHIER],
  },
];

const UNIT_ICONS = [
  { icon: Wrench, label: "Bengkel", color: "text-orange-400" },
  { icon: Droplets, label: "Steam", color: "text-cyan-400" },
  { icon: Coffee, label: "Cafe", color: "text-amber-400" },
];

interface SidebarProps {
  role: string;
  email: string;
  onClose?: () => void;
}

function Sidebar({ role, email, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Berhasil logout");
    router.push("/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex flex-col h-full w-64 bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              SK
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                {APP_NAME}
              </p>
              <p className="text-gray-500 text-xs">{APP_TAGLINE}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Unit icons */}
        <div className="flex gap-3 mt-4">
          {UNIT_ICONS.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className={`flex items-center gap-1 text-xs ${color}`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-gray-800">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            role === ROLES.OWNER
              ? "bg-purple-900/60 text-purple-300"
              : "bg-blue-900/60 text-blue-300"
          }`}
        >
          {role === ROLES.OWNER ? "👑 Owner" : "🧾 Kasir"}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500 text-white">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold uppercase">
            {email[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export { Sidebar, NAV_ITEMS };
