"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = (await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      })) as { error?: { message?: string } } | undefined;

      if (result?.error) {
        setError(
          result.error.message ||
            "Google sign-up is not available right now."
        );
        setLoading(false);
      }
    } catch {
      setError("Google sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        ...(image.trim() ? { image: image.trim() } : {}),
      });

      if (result.error) {
        setError(result.error.message || "Registration failed. Please try again.");
        return;
      }

      router.push("/dashboard");
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
          Create Account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Join SalonBook and book your next salon appointment.
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

        <form onSubmit={handleRegister} className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters, upper & lower case"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#9b6b43] hover:underline">
            Sign In
          </Link>
        </p>

        <Link href="/" className="mt-5 block text-center text-sm text-gray-500 hover:text-[#9b6b43]">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
