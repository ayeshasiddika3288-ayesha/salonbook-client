"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, signIn, signOut, signUp } from "@/lib/auth";
import type { UserWithRole } from "@/lib/auth";
import { getRoleHome, isBlockedUser, resolveSocialRedirect } from "@/lib/auth-routing";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read the selected image."));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

const isValidImageUrl = (value: string): boolean => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
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

  const fail = (message: string) => {
    setError(message);
    toast.error(message);
  };

  const validate = (): string => {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email address is required.";
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (image && !IMAGE_TYPES.includes(image.type)) {
      return "Please select a PNG, JPG, WEBP, or GIF image.";
    }
    if (image && image.size > MAX_IMAGE_SIZE) return "Image size must be 5 MB or less.";
    if (!image && imageUrl.trim() && !isValidImageUrl(imageUrl.trim())) {
      return "Please enter a valid image URL starting with http or https.";
    }
    return "";
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const requested = new URLSearchParams(window.location.search).get("redirect");
      const result = await signIn.social({
        provider: "google",
        callbackURL: resolveSocialRedirect(requested),
        errorCallbackURL: "/auth/login",
      });

      if (result?.error) {
        fail(result.error.message || "Google sign-up is not available right now.");
        setLoading(false);
      }
    } catch {
      fail("Google sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const problem = validate();
    if (problem) {
      fail(problem);
      return;
    }

    setLoading(true);

    try {
      const profileImage = image ? await fileToDataUrl(image) : imageUrl.trim() || undefined;

      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(profileImage ? { image: profileImage } : {}),
      });

      if (result.error) {
        fail(result.error.message || "Registration failed. Please try again.");
        return;
      }

      const session = await authClient.getSession();
      const user = (session.data?.user || result.data?.user) as
        | UserWithRole
        | undefined;

      if (isBlockedUser(user)) {
        await signOut();
        fail("Your account has been blocked. Please contact support.");
        return;
      }

      toast.success("Account created successfully.");
      if (session.data?.user) {
        router.replace(getRoleHome(user?.role));
        router.refresh();
      } else {
        router.replace("/auth/login?registered=1");
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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

        <h1 className="mt-8 text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Register to book your next salon appointment.
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
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#f8f5f2] file:px-3 file:py-2 file:font-medium file:text-[#9b6b43] hover:file:bg-[#f0e8e0]"
            />
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP, or GIF. Maximum 5 MB.</p>
            {image && <p className="mt-2 break-all text-xs text-gray-600">Selected: {image.name}</p>}

            <div className="mt-4">
              <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-gray-700">
                Or use an image URL
              </label>
              <input
                id="imageUrl"
                type="url"
                autoComplete="photo"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#9b6b43] focus:ring-2 focus:ring-[#9b6b43]/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                A selected file takes priority over this URL.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#9b6b43] hover:underline">
            Login
          </Link>
        </p>

        <Link href="/" className="mt-5 block text-center text-sm text-gray-500 hover:text-[#9b6b43]">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
