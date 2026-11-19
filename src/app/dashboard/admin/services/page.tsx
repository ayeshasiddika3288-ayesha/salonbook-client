
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
}

interface ServiceForm {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  status: "active" | "inactive";
}

const initialForm: ServiceForm = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  image: "",
  status: "active",
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });

function AdminServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch(
        "/api/services/admin/all"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load services.");
      }

      setServices(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : form.image);
  };

  const uploadServiceImage = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);

    const response = await authenticatedFetch("/api/uploads", {
      method: "POST",
      body: JSON.stringify({ image: dataUrl }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.data.url as string;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      let imageUrl = form.image;

      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile);
      }

      if (!imageUrl) {
        throw new Error("Please upload a service image.");
      }

      const payload = {
        ...form,
        image: imageUrl,
        price: Number(form.price),
        duration: Number(form.duration),
      };

      const response = await authenticatedFetch(
        editingId
          ? `/api/services/${editingId}`
          : "/api/services",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save service.");
      }

      setMessage(
        editingId
          ? "Service updated successfully."
          : "New service added successfully."
      );

      resetForm();
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service._id);

    setForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image,
      status: service.status,
    });

    setImageFile(null);
    setImagePreview(service.image);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await authenticatedFetch(
        `/api/services/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete service.");
      }

      setMessage("Service deleted successfully.");
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleStatusChange = async (service: Service) => {
    try {
      setMessage("");
      setError("");

      const newStatus =
        service.status === "active" ? "inactive" : "active";

      const response = await authenticatedFetch(
        `/api/services/${service._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update status.");
      }

      setMessage(`Service is now ${newStatus}.`);
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="font-semibold uppercase tracking-widest text-[#8b5e3c]">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#684329] md:text-4xl">
            Manage Services
          </h1>
          <p className="mt-3 text-[#8b8178]">
            Add, edit, delete and manage salon services.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#684329]">
              {editingId ? "Edit Service" : "Add New Service"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#d8c8b8] px-4 py-2 text-sm font-semibold text-[#684329] hover:bg-[#faf7f2]"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Service Name
                </label>
                <input
                  name="serviceName"
                  value={form.serviceName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Hair Cut"
                  className="w-full rounded-xl border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Hair"
                  className="w-full rounded-xl border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price (BDT)
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="500"
                  className="w-full rounded-xl border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Duration (Minutes)
                </label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  placeholder="30"
                  className="w-full rounded-xl border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Service Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-[#e9dfd4] p-3 text-sm outline-none focus:border-[#8b5e3c]"
                />
                <p className="mt-1 text-xs text-[#8b8178]">
                  Upload a new image (PNG, JPG or WEBP up to 5 MB).
                  {editingId
                    ? " Your current image is kept if you don't choose a new one."
                    : ""}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e9dfd4] bg-white px-4 py-3 outline-none focus:border-[#8b5e3c]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {(imagePreview || form.image) && (
              <div>
                <p className="mb-2 text-sm font-semibold">Image Preview</p>
                <img
                  src={imagePreview || form.image}
                  alt="Service preview"
                  className="h-40 w-48 rounded-xl border border-[#e9dfd4] object-cover"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe this salon service..."
                className="w-full rounded-xl border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#8b5e3c] px-7 py-3 font-semibold text-white transition hover:bg-[#684329] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Service"
                  : "Add Service"}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#684329]">
              All Services ({services.length})
            </h2>

            <button
              onClick={fetchServices}
              className="rounded-lg border border-[#d8c8b8] px-4 py-2 text-sm font-semibold text-[#684329] hover:bg-white"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
              No services found. Add your first service above.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="overflow-hidden rounded-2xl border border-[#e9dfd4] bg-white shadow-sm"
                >
                  <img
                    src={service.image}
                    alt={service.serviceName}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#f5eee7] px-3 py-1 text-xs font-semibold text-[#8b5e3c]">
                        {service.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#684329]">
                      {service.serviceName}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#8b8178]">
                      {service.description}
                    </p>

                    <div className="mt-4 flex justify-between text-sm font-semibold">
                      <span>৳{service.price}</span>
                      <span>{service.duration} min</span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="rounded-lg bg-[#f5eee7] px-2 py-2 text-sm font-semibold text-[#684329] hover:bg-[#eadbcd]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleStatusChange(service)}
                        className="rounded-lg border border-[#d8c8b8] px-2 py-2 text-xs font-semibold text-[#684329] hover:bg-[#faf7f2]"
                      >
                        {service.status === "active" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(service._id)}
                        className="rounded-lg bg-red-50 px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminServicesContent />
    </RoleGuard>
  );
}
