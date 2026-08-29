/**
 * Root page — the middleware handles all redirects
 * (unauthenticated → /login, authenticated → /owner or /cashier).
 * This file is a fallback that should never be rendered in practice.
 */
export default function RootPage() {
  return null;
}
