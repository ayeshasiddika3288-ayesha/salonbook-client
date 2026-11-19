
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/auth-client";

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  status: "active" | "inactive";
}

interface ServiceResponse {
  success: boolean;
  data: Service;
  message?: string;
}

interface UserWithRole {
  role?: string;
}

function ServiceDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user as UserWithRole | undefined;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/api/services/${params.id}`
        );

        const result: ServiceResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Service not found.");
        }

        setService(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const handleBooking = () => {
    if (!service || isPending) return;

    setBookingError("");

    if (!session) {
      router.push(`/auth/login?service=${service._id}`);
      return;
    }

    if (user?.role !== "customer") {
      setBookingError("Only customer accounts can book appointments.");
      return;
    }

    router.push(`/booking?service=${service._id}`);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <Link
          href="/services"
          className="mb-8 inline-block text-sm font-medium text-[#8b5e3c] hover:underline"
        >
          ← Back to Services
        </Link>

        {loading && (
          <div className="py-24 text-center">
            <p className="text-lg text-[#684329]">
              Loading service details...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-700">
              Service Not Found
            </h2>
            <p className="mt-3 text-red-600">{error}</p>
            <Link
              href="/services"
              className="mt-6 inline-block rounded-lg bg-[#684329] px-6 py-3 text-white hover:bg-[#8b5e3c]"
            >
              Browse Services
            </Link>
          </div>
        )}

        {!loading && !error && service && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-[#eee5dc]">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-full min-h-[320px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-6xl text-[#8b5e3c]">
                  ✂
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <span className="mb-4 w-fit rounded-full bg-[#eee5dc] px-4 py-2 text-sm font-medium text-[#684329]">
                {service.category}
              </span>

              <h1 className="text-3xl font-bold text-[#684329] md:text-4xl">
                {service.serviceName}
              </h1>

              <p className="mt-5 leading-8 text-[#6b625a]">
                {service.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="mt-2 text-2xl font-bold text-[#684329]">
                    ৳{service.price}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="mt-2 text-2xl font-bold text-[#684329]">
                    {service.duration} min
                  </p>
                </div>
              </div>

              {service.status === "active" ? (
                <>
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={isPending}
                    className="mt-8 rounded-xl bg-[#684329] px-6 py-4 font-semibold text-white transition hover:bg-[#8b5e3c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Checking Account..." : "Book This Service →"}
                  </button>

                  {bookingError && (
                    <p className="mt-3 text-sm text-red-600">
                      {bookingError}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-8 rounded-xl bg-gray-200 p-4 text-center font-medium text-gray-600">
                  This service is currently unavailable.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-[#e9dfd4] py-6 text-center text-sm text-[#8b8178]">
        © 2026 SalonBook. All rights reserved.
      </footer>
    </div>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
          <p className="text-lg text-[#684329]">
            Loading service details...
          </p>
        </div>
      }
    >
      <ServiceDetailsContent />
    </Suspense>
  );
}
