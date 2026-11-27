"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_CLIENT_URL
      ? `${process.env.NEXT_PUBLIC_CLIENT_URL.replace(/\/+$/, "")}/api/auth`
      : "/api/auth",
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
