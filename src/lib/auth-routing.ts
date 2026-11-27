// Pure client-side helpers for deciding where an authenticated user belongs.
// This module never contacts the API and is safe to import from any component.

export type AppRole = "admin" | "customer";

export interface AuthUserLike {
  role?: string | null;
  isBlocked?: boolean | null;
}

export const getRoleHome = (role?: string | null): string =>
  role === "admin" ? "/dashboard/admin" : "/dashboard/customer";

export const isBlockedUser = (user?: AuthUserLike | null): boolean =>
  user?.isBlocked === true;

/**
 * Resolve a post-login redirect without allowing an open redirect or letting a
 * user cross into another role's dashboard by editing the `redirect` query.
 */
export function resolveAuthRedirect(
  requested: string | null | undefined,
  role?: string | null
): string {
  const home = getRoleHome(role);

  if (!requested) return home;

  // Backslashes can be treated as slashes by browsers; normalise before checks.
  const value = requested.replace(/\\/g, "/");

  if (!value.startsWith("/") || value.startsWith("//")) return home;

  const path = value.split(/[?#]/)[0] || "/";

  if (role === "admin") {
    return path === "/dashboard" || path.startsWith("/dashboard/admin")
      ? value
      : home;
  }

  const allowedCustomerPaths = [
    "/booking",
    "/dashboard",
    "/dashboard/customer",
    "/services/",
  ];

  return allowedCustomerPaths.some((prefix) => path.startsWith(prefix))
    ? value
    : home;
}

/**
 * Resolve a social-login redirect before the role is known. Only known app
 * paths are accepted; /dashboard then routes by the authenticated user's role.
 */
export function resolveSocialRedirect(
  requested: string | null | undefined
): string {
  if (!requested) return "/dashboard";

  const value = requested.replace(/\\/g, "/");

  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";

  const path = value.split(/[?#]/)[0] || "/";
  const allowedPrefixes = [
    "/dashboard",
    "/booking",
    "/services",
  ];

  return allowedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
    ? value
    : "/dashboard";
}

