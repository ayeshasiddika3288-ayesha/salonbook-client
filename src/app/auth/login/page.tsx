"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const target =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = (await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${target}`,
      })) as { error?: { message?: string } } | undefined;

      if (result?.error) {
        setError(
          result.error.message ||
            "Google sign-in is not available right now."
        );
        setLoading(false);
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed. Please try again.");
        return;
      }

      router.push(target);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link href="/" className="text-2xl font-bold text-[#9b6b43]">
          SalonBook
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to manage your salon appointments.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg font-bold text-[#4285F4]">G</span>
          Continue with Google
        </button>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          or
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#9b6b43] px-4 py-3 font-semibold text-white transition hover:bg-[#805532] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-[#9b6b43] hover:underline">
            Create Account
          </Link>
        </p>

        <Link href="/" className="mt-5 block text-center text-sm text-gray-500 hover:text-[#9b6b43]">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
          <p className="text-[#9b6b43]">Loading sign in...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
