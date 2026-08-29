"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Wrench, Droplets, Coffee, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLES, ROUTES, APP_NAME, APP_TAGLINE } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Login gagal", { description: error.message });
      setLoading(false);
      return;
    }

    const role = authData.user?.user_metadata?.role as string | undefined;
    toast.success(`Selamat datang! 👋`);

    // Redirect based on role
    if (role === ROLES.OWNER) {
      router.push(ROUTES.OWNER_DASHBOARD);
    } else {
      router.push(ROUTES.CASHIER_POS);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />

        {/* Logo area */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center font-bold text-2xl">
              SK
            </div>
            <div>
              <h1 className="text-2xl font-bold">{APP_NAME}</h1>
              <p className="text-blue-200 text-sm">{APP_TAGLINE}</p>
            </div>
          </div>
        </div>

        {/* Business unit cards */}
        <div className="relative z-10 space-y-4">
          <p className="text-blue-200 text-sm uppercase tracking-widest font-semibold mb-6">
            Unit Bisnis
          </p>

          {[
            {
              icon: Wrench,
              label: "Bengkel (Auto Repair)",
              desc: "Servis, Ganti Oli, Tune Up",
              color: "bg-orange-500/20 text-orange-300",
            },
            {
              icon: Droplets,
              label: "Steam Car Wash",
              desc: "Cuci Motor & Mobil",
              color: "bg-cyan-500/20 text-cyan-300",
            },
            {
              icon: Coffee,
              label: "Cafe SK Motor",
              desc: "Kopi, Minuman & Makanan",
              color: "bg-amber-500/20 text-amber-300",
            },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-blue-300 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-blue-400 text-xs">
          © 2025 SK Motor · Point of Sale & Management System
        </p>
      </div>

      {/* ── Right panel (login form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-3">
              SK
            </div>
            <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-gray-400 text-sm">{APP_TAGLINE}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Selamat datang</h2>
            <p className="text-gray-400">Masuk untuk mengakses sistem POS</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="kasir@skmotor.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold transition-colors mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 text-xs">
            Hubungi Owner untuk reset password atau akun baru.
          </p>
        </div>
      </div>
    </div>
  );
}
