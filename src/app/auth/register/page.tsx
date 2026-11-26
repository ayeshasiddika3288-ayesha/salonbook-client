"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, signIn, signUp } from "@/lib/auth";
import type { UserWithRole } from "@/lib/auth";
import {
  getRoleHome,
  isBlockedUser,
  resolveSocialRedirect,
  toClientCallbackURL,
} from "@/lib/auth-routing";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the selected image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected image."));
    };

    reader.readAsDataURL(file);
  });
};

const isValidImageUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: toClientCallbackURL(
          resolveSocialRedirect(
            typeof window === "undefined"
              ? null
              : new URLSearchParams(window.location.search).get("redirect")
          )
        ),
        errorCallbackURL: toClientCallbackURL("/auth/login"),
      });

      if (result?.error) {
        const message =
          result.error.message ||
          "Google sign-up is not available right now.";

        setError(message);
        toast.error(message);
        setLoading(false);
      }
    } catch {
      const message = "Google sign-up failed. Please try again.";

      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (password.length < 6) {
      const message = "Password must be at least 6 characters long.";

      setError(message);
      toast.error(message);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      const message = "Password must contain at least one uppercase letter.";

      setError(message);
      toast.error(message);
      return;
    }

    if (!/[a-z]/.test(password)) {
      const message = "Password must contain at least one lowercase letter.";

      setError(message);
      toast.error(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match.";

      setError(message);
      toast.error(message);
      return;
    }

    if (image) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        const message = "Please select a PNG, JPG, WEBP or GIF image.";

        setError(message);
        toast.error(message);
        return;
      }

      if (image.size > MAX_IMAGE_SIZE) {
        const message = "Image size must be 5 MB or less.";

        setError(message);
        toast.error(message);
        return;
      }
    }

    if (!image && imageUrl.trim() && !isValidImageUrl(imageUrl.trim())) {
      const message = "Please enter a valid image URL starting with http or https.";

      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      let profileImageUrl = imageUrl.trim() || undefined;

      // Upload selected image before creating the account. A chosen file takes
      // priority over a pasted URL.
      if (image) {
        if (!API_URL) {
          throw new Error("Server URL is not configured.");
        }

        const imageData = await fileToBase64(image);

        const uploadResponse = await fetch(
          `${API_URL}/api/uploads/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageData,
            }),
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.message || "Image upload failed."
          );
        }

        profileImageUrl = uploadResult.data.url;
      }

      // Public signup can only create a customer; role is controlled by the
      // server's additional-field configuration.
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(profileImageUrl ? { image: profileImageUrl } : {}),
      });

      if (result.error) {
        const message =
          result.error.message || "Registration failed. Please try again.";

        setError(message);
        toast.error(message);
        return;
      }

      const session = await authClient.getSession();
      const user = (session.data?.user ||
        result.data?.user) as UserWithRole | undefined;

      if (isBlockedUser(user)) {
        const message =
          "Your account has been blocked. Please contact support.";

        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created successfully.");

      if (session.data?.user) {
        // Better Auth signs the user in automatically, so go straight to the
        // correct dashboard. Fall back to sign-in if no session was created.
        router.replace(getRoleHome(user?.role));
        router.refresh();
      } else {
        router.push("/auth/login?registered=1");
      }
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setError(message);
      toast.error(message);
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
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Profile Image{" "}
              <span className="text-gray-400">(optional)</span>
            </label>

            <input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => {
                setImage(e.target.files?.[0] || null);
                setError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#f8f5f2] file:px-3 file:py-2 file:font-medium file:text-[#9b6b43] hover:file:bg-[#f0e8e0]"
            />

            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, WEBP or GIF. Maximum 5 MB.
            </p>

            {image && (
              <p className="mt-2 break-all text-xs text-gray-600">
                Selected: {image.name}
              </p>
            )}

            <div className="mt-4">
              <label
                htmlFor="imageUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Or use an image URL
              </label>

              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
              />

              <p className="mt-1 text-xs text-gray-400">
                A selected file takes priority over this URL.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
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
          <Link
            href="/auth/login"
            className="font-semibold text-[#9b6b43] hover:underline"
          >
            Sign In
          </Link>
        </p>

        <Link
          href="/"
          className="mt-5 block text-center text-sm text-gray-500 hover:text-[#9b6b43]"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}