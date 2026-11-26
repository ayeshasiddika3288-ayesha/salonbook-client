"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth";
import { authenticatedFetch } from "@/lib/api";

interface ProfileUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
}

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  initialImage: string;
  email: string;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });

function AdminProfileForm({
  initialName,
  initialPhone,
  initialImage,
  email,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [image, setImage] = useState(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
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
        phone: phone.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message || "Profile update failed.");
      }

      setImage(imageUrl);
      setImageFile(null);
      setPreview("");
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-[#684329]">My Profile</h1>

        <p className="mt-2 text-sm text-[#766e67]">
          Manage your admin account information.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-5">
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
              value={email}
              readOnly
              className="w-full rounded-lg border border-[#e9dfd4] bg-gray-50 px-4 py-3 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block font-semibold">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+880 1700 000000"
              className="w-full rounded-lg border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
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

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#684329] px-6 py-3 font-semibold text-white transition hover:bg-[#8b5e3c] disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminProfileContent() {
  const { data: session, isPending } = useSession();
  const user = session?.user as ProfileUser | undefined;

  if (isPending || !session || !user) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <AdminProfileForm
      key={user.id || user.email || "profile"}
      initialName={user.name || ""}
      initialPhone={user.phone || ""}
      initialImage={user.image || ""}
      email={user.email || ""}
    />
  );
}

export default function AdminProfilePage() {
  return <AdminProfileContent />;
}
