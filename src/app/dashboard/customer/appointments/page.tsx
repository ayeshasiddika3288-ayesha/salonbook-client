
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  serviceId: { serviceName?: string } | string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
}

function CustomerAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/appointments/my");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load appointments.");
      }

      setAppointments(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setCancellingId(id);
      setError("");
      setMessage("");

      const response = await authenticatedFetch(
        `/api/appointments/${id}/cancel`,
        { method: "PATCH" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not cancel appointment.");
      }

      setMessage("Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCancellingId(null);
    }
  };

  const serviceName = (service: Appointment["serviceId"]) =>
    typeof service === "object" ? service.serviceName || "Salon Service" : "Salon Service";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-widest text-[#8b5e3c]">
              Customer Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#684329]">
              My Appointments
            </h1>
            <p className="mt-2 text-[#8b8178]">
              View and manage your salon bookings.
            </p>
          </div>

          <Link
            href="/services"
            className="rounded-lg bg-[#8b5e3c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#684329]"
          >
            Book a Service
          </Link>
        </div>

        {message && <p className="mb-5 rounded-xl bg-green-50 p-4 text-green-700">{message}</p>}
        {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-[#684329]">No appointments yet</h2>
            <p className="mt-2 text-[#8b8178]">Book your first salon service today.</p>
            <Link href="/services" className="mt-5 inline-block font-semibold text-[#8b5e3c]">
              Explore Services →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((item) => (
              <article key={item._id} className="rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#8b5e3c]">{serviceName(item.serviceId)}</p>
                    <p className="mt-1 text-xs text-[#8b8178]">Booking ID: {item._id}</p>
                  </div>
                  <span className="h-fit rounded-full bg-[#f5eee7] px-4 py-2 text-xs font-bold capitalize text-[#684329]">
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
                  <div><p className="text-[#8b8178]">Date</p><p className="mt-1 font-semibold">{formatDate(item.appointmentDate)}</p></div>
                  <div><p className="text-[#8b8178]">Time</p><p className="mt-1 font-semibold">{item.timeSlot}</p></div>
                  <div><p className="text-[#8b8178]">Price</p><p className="mt-1 font-semibold">৳{item.servicePrice}</p></div>
                  <div><p className="text-[#8b8178]">Payment</p><p className="mt-1 font-semibold capitalize">{item.paymentStatus}</p></div>
                </div>

                {item.message && <p className="mt-4 rounded-lg bg-[#faf7f2] p-3 text-sm text-[#684329]">{item.message}</p>}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eee5dc] pt-4">
                  {item.status === "confirmed" && item.paymentStatus === "unpaid" && (
                    <Link
                      href={`/dashboard/customer/payments?appointment=${item._id}`}
                      className="rounded-lg bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#684329]"
                    >
                      Pay Now
                    </Link>
                  )}

                  {item.status === "pending" && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      disabled={cancellingId === item._id}
                      className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === item._id ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerAppointmentsPage() {
  return (
    <RoleGuard allowedRole="customer">
      <CustomerAppointmentsContent />
    </RoleGuard>
  );
}
