import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROUTES, ROLES } from "@/lib/constants";

/**
 * Next.js Middleware
 *
 * Responsibilities:
 * 1. Refresh the Supabase session on every request (keeps JWT alive)
 * 2. Redirect unauthenticated users to /login
 * 3. Redirect authenticated users away from /login to the correct dashboard
 * 4. Enforce role-based path access (owner vs cashier)
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and getUser().
  // A session refresh MUST happen before any other logic.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === ROUTES.LOGIN;
  const isRootPage = pathname === "/";

  // ── Not authenticated ──────────────────────────────
  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(redirectUrl);
  }

  // ── Authenticated ──────────────────────────────────
  if (user) {
    // Get role from user metadata (set when creating the user in Step 2)
    const role = user.user_metadata?.role as string | undefined;

    // Redirect away from login / root
    if (isLoginPage || isRootPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        role === ROLES.OWNER ? ROUTES.OWNER_DASHBOARD : ROUTES.CASHIER_POS;
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based path protection
    if (pathname.startsWith("/owner/staff") && role !== ROLES.OWNER) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ROUTES.CASHIER_POS;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
