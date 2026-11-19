"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authClient, useSession } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });

function AdminProfileContent() {
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session?.user]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = image;

      if (imageFile) {
        const dataUrl = await readFileAsDataUrl(imageFile);

        const uploadResponse = await authenticatedFetch("/api/uploads", {
          method: "POST",
          body: JSON.stringify({ image: dataUrl }),
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.message || "Profile image upload failed."
          );
        }

        imageUrl = uploadResult.data.url;
      }

      const result = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl,
      });

      if (result.error) {
        throw new Error(result.error.message || "Profile update failed.");
      }

      setImage(imageUrl);
      setImageFile(null);
      setPreview("");
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session) {
    return <p className="p-10 text-center">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-block text-sm text-[#8b5e3c] hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-[#684329]">
            My Profile
          </h1>

          <p className="mt-2 text-[#8b8178]">
            Manage your admin account information.
          </p>

          <form onSubmit={handleUpdate} className="mt-8 space-y-6">
            <div className="flex items-center gap-5">
              {preview || image ? (
                <img
                  src={preview || image}
                  alt={name || "Profile"}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ede4] text-2xl font-bold text-[#8b5e3c]">
                  {name.charAt(0).toUpperCase() || "A"}
                </span>
              )}

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-semibold"
                >
                  Profile Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm"
                />
                <p className="mt-1 text-xs text-[#8b8178]">
                  PNG, JPG or WEBP up to 5 MB.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block font-semibold">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block font-semibold">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={session.user.email || ""}
                readOnly
                className="w-full rounded-lg border border-[#e9dfd4] bg-gray-50 px-4 py-3 text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Role</label>
              <input
                type="text"
                value="Admin"
                readOnly
                className="w-full rounded-lg border border-[#e9dfd4] bg-gray-50 px-4 py-3 text-gray-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#684329] px-6 py-3 font-semibold text-white hover:bg-[#8b5e3c] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminProfileContent />
    </RoleGuard>
  );
}
