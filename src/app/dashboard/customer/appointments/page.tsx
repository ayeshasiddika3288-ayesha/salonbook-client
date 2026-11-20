"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authenticatedFetch } from "@/lib/api";

interface ServiceInfo {
  _id?: string;
  serviceName?: string;
  category?: string;
  description?: string;
  duration?: number;
  image?: string;
}

interface Appointment {
  _id: string;
  serviceId: ServiceInfo | string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function CustomerAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

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
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);

      const response = await authenticatedFetch(
        `/api/appointments/${cancelTarget._id}/cancel`,
        { method: "PATCH" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not cancel appointment.");
      }

      toast.success("Appointment cancelled successfully.");
      setCancelTarget(null);
      await fetchAppointments();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setCancelling(false);
    }
  };

  const serviceInfo = (service: Appointment["serviceId"]): ServiceInfo =>
    typeof service === "object" && service ? service : {};

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a17a50]">
            Customer Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#684329]">
            My Appointments
          </h1>
          <p className="mt-2 text-sm text-[#766e67]">
            View your booking requests, service details and payment status.
          </p>
        </div>

        <Link
          href="/services"
          className="rounded-full bg-[#8b5e3c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#684329]"
        >
          + Book a Service
        </Link>
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchAppointments}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-10 text-center text-[#766e67]">
          Loading appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-[#684329]">
            No appointments yet
          </h2>
          <p className="mt-2 text-sm text-[#766e67]">
            Book your first salon service today.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-block font-semibold text-[#8b5e3c] hover:underline"
          >
            Explore Services →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {appointments.map((item) => {
            const service = serviceInfo(item.serviceId);

            return (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-[#e9dfd4] bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="h-40 w-full shrink-0 overflow-hidden bg-[#eee5dc] sm:h-auto sm:w-48">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.serviceName || "Salon service"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-32 items-center justify-center text-5xl text-[#8b5e3c]">
                        ✂
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {service.category && (
                            <span className="rounded-full bg-[#f4ede4] px-3 py-1 text-xs font-semibold text-[#8b5e3c]">
                              {service.category}
                            </span>
                          )}
                          <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs font-semibold text-[#766e67]">
                            {item.paymentStatus === "paid"
                              ? "Paid"
                              : "Payment pending"}
                          </span>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-[#29231f]">
                          {service.serviceName || "Salon Service"}
                        </h2>

                        <p className="mt-1 text-xs text-[#96897d]">
                          Requested on{" "}
                          {item.createdAt
                            ? formatDateTime(item.createdAt)
                            : "—"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${
                          statusStyles[item.status] ||
                          "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-[#8b8178]">Appointment Date</p>
                        <p className="mt-1 font-semibold">
                          {formatDate(item.appointmentDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#8b8178]">Time Slot</p>
                        <p className="mt-1 font-semibold">{item.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-[#8b8178]">Price</p>
                        <p className="mt-1 font-semibold">
                          ৳{item.servicePrice.toLocaleString("en-BD")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#8b8178]">Service Duration</p>
                        <p className="mt-1 font-semibold">
                          {service.duration
                            ? `${service.duration} minutes`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <details className="group mt-4 rounded-xl bg-[#faf7f2] p-4">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-[#8b5e3c]">
                        Booking details
                        <span className="ml-2 inline-block transition group-open:rotate-180">
                          ▾
                        </span>
                      </summary>

                      <div className="mt-3 space-y-2 text-sm text-[#6b625a]">
                        <p className="break-all">
                          <span className="font-semibold text-[#684329]">
                            Booking ID:
                          </span>{" "}
                          {item._id}
                        </p>
                        {service.description && (
                          <p>
                            <span className="font-semibold text-[#684329]">
                              Service description:
                            </span>{" "}
                            {service.description}
                          </p>
                        )}
                        {item.message && (
                          <p>
                            <span className="font-semibold text-[#684329]">
                              Your request:
                            </span>{" "}
                            {item.message}
                          </p>
                        )}
                      </div>
                    </details>

                    <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eee5dc] pt-4">
                      {item.status === "confirmed" &&
                        item.paymentStatus === "unpaid" && (
                          <Link
                            href={`/dashboard/customer/payments?appointment=${item._id}`}
                            className="rounded-lg bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#684329]"
                          >
                            Pay Now
                          </Link>
                        )}

                      {item.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(item)}
                          className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this appointment?"
        description="Your pending appointment request will be cancelled and the time slot will be released."
        confirmLabel="Yes, cancel it"
        destructive
        busy={cancelling}
        onConfirm={cancelAppointment}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

export default function CustomerAppointmentsPage() {
  return <CustomerAppointmentsContent />;
}
