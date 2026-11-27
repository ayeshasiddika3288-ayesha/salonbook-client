import dns from "node:dns/promises";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";

// Windows can fail to resolve MongoDB Atlas SRV records; use public DNS.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const globalForAuth = globalThis as unknown as {
  mongoClient?: MongoClient;
  betterAuth?: ReturnType<typeof betterAuth>;
};

function getMongoClient() {
  if (globalForAuth.mongoClient) return globalForAuth.mongoClient;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required for authentication.");
  }

  const client = new MongoClient(mongoUri, {
    maxPoolSize: 10,
    maxIdleTimeMS: 60_000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForAuth.mongoClient = client;
  }

  return client;
}

function createAuth() {
  const client = getMongoClient();
  const db = client.db(process.env.MONGODB_DB || "salonbook");
  const baseURL =
    process.env.NEXT_PUBLIC_CLIENT_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [baseURL],
    database: mongodbAdapter(db, { client }),
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
              mapProfileToUser: (profile) => ({
                image: profile.picture,
              }),
            },
          }
        : undefined,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    plugins: [jwt()],
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "customer",
          input: false,
        },
        isBlocked: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
        phone: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email" || !ctx.body) return;

        const body = ctx.body as Record<string, unknown>;
        const password = typeof body.password === "string" ? body.password : "";

        if (password.length < 6) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must be at least 6 characters.",
          });
        }
        if (!/[A-Z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must contain at least one uppercase letter.",
          });
        }
        if (!/[a-z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must contain at least one lowercase letter.",
          });
        }

        // Public registration always creates a customer. Admin access is
        // assigned securely in the database.
        return {
          context: {
            body: {
              ...body,
              role: "customer",
              isBlocked: false,
            },
          },
        };
      }),
    },
  });
}

export const auth = (globalForAuth.betterAuth ?? createAuth()) as ReturnType<
  typeof betterAuth
>;

if (process.env.NODE_ENV !== "production") {
  globalForAuth.betterAuth = auth;
}
