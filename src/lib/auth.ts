"use client";

import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  jwtClient,
} from "better-auth/client/plugins";

// Auth stays on the client origin: next.config.ts proxies /api/auth/* to the
// Express API. Use the configured client URL when present, otherwise fall back
// to the same-origin /api/auth path. Never use the server URL here.
const clientURL = (process.env.NEXT_PUBLIC_CLIENT_URL || "").replace(
  /\/+$/,
  ""
);

export const authClient = createAuthClient({
  ...(clientURL ? { baseURL: clientURL } : {}),

  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: false,
        },
        isBlocked: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        phone: {
          type: "string",
          required: false,
          defaultValue: "",
          input: true,
        },
      },
    }),
  ],

  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

export interface UserWithRole {
  role?: string;
  isBlocked?: boolean;
  phone?: string | null;
}
