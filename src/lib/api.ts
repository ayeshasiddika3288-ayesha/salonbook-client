"use client";

import { authClient } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
) {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Please sign in to continue.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${data.token}`);

  if (
    options.body &&
    typeof FormData !== "undefined" &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Expired sessions and blocked users must not keep a protected dashboard
  // open. The server remains the authority for both checks. A normal role
  // denial (FORBIDDEN) must not log the user out as if they were blocked.
  if (response.status === 401 || response.status === 403) {
    let code = "";

    try {
      const body = await response.clone().json();
      code = body?.code || "";
    } catch {
      // The server did not return JSON; keep the status-based fallback below.
    }

    if (response.status === 401 || code === "USER_BLOCKED") {
      await authClient.signOut();

      const message =
        code === "USER_BLOCKED"
          ? "Your account has been blocked. Please contact support."
          : "Your session has expired. Please sign in again.";

      if (typeof window !== "undefined") {
        // Full reload is intentional: it clears any cached session state.
        window.location.assign(
          new URL("/auth/login", window.location.origin).toString()
        );
      }

      throw new Error(message);
    }

    throw new Error("You do not have permission to perform this action.");
  }

  return response;
}

/** Parse a protected API response and surface the server's error message. */
export async function authenticatedFetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(path, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Request failed. Please try again.");
  }

  return result as T;
}
