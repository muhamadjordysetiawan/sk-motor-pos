"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  role: string;
  email: string;
  children: React.ReactNode;
}

/**
 * Client component shell for the dashboard.
 * Manages mobile sidebar open/close state.
 */
export function DashboardShell({ role, email, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar role={role} email={email} />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-64">
            <Sidebar
              role={role}
              email={email}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">SK Motor POS</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
