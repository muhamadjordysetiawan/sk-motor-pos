import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Protected dashboard layout.
 * Server Component — fetches the authenticated user and passes
 * role + email to the client-side shell for the sidebar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const role = (user.user_metadata?.role as string) ?? "cashier";
  const email = user.email ?? "user@skmotor.com";

  return (
    <DashboardShell role={role} email={email}>
      {children}
    </DashboardShell>
  );
}
