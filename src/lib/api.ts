import { authClient } from "./auth-client";

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

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}
