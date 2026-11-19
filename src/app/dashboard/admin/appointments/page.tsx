
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

interface ServiceInfo {
  serviceName?: string;
  category?: string;
}

interface Appointment {
  _id: string;
  customerId: string;
  serviceId: ServiceInfo | string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

function AdminAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/appointments");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load appointments.");
      }

      setAppointments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) => {
    const action = status === "confirmed" ? "confirm" : "cancel";

    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      return;
    }

    try {
      setUpdatingId(appointmentId);
      setMessage("");
      setError("");

      const response = await authenticatedFetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update appointment.");
      }

      setMessage(`Appointment ${action}ed successfully.`);
      await fetchAppointments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((appointment) => appointment.status === filter);

  const counts = {
    all: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
  };

  const getServiceName = (service: ServiceInfo | string) => {
    return typeof service === "object"
      ? service.serviceName || "Salon Service"
      : "Salon Service";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            Manage Appointments
          </h1>
          <p className="mt-3 text-[#8b8178]">
            Review bookings and manage customer appointment requests.
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

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "All Bookings", value: counts.all },
            { label: "Pending", value: counts.pending },
            { label: "Confirmed", value: counts.confirmed },
            { label: "Cancelled", value: counts.cancelled },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-[#8b8178]">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#684329]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "confirmed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  filter === status
                    ? "bg-[#8b5e3c] text-white"
                    : "border border-[#e9dfd4] bg-white text-[#684329] hover:bg-[#f5eee7]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAppointments}
            className="rounded-lg border border-[#d8c8b8] px-4 py-2 text-sm font-semibold text-[#684329] hover:bg-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
            No {filter === "all" ? "" : filter} appointments found.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8b5e3c]">
                      {getServiceName(appointment.serviceId)}
                    </span>

                    <h2 className="mt-2 text-lg font-bold text-[#684329]">
                      Appointment Details
                    </h2>

                    <p className="mt-1 break-all text-xs text-[#8b8178]">
                      ID: {appointment._id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[#8b8178]">Customer ID</p>
                    <p className="mt-1 break-all font-medium">
                      {appointment.customerId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Appointment Date</p>
                    <p className="mt-1 font-medium">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Time Slot</p>
                    <p className="mt-1 font-medium">{appointment.timeSlot}</p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Service Price</p>
                    <p className="mt-1 font-medium">
                      ৳{appointment.servicePrice}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Payment Status</p>
                    <p
                      className={`mt-1 font-semibold ${
                        appointment.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {appointment.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Booked On</p>
                    <p className="mt-1 font-medium">
                      {formatDate(appointment.createdAt)}
                    </p>
                  </div>
                </div>

                {appointment.message && (
                  <div className="mt-5 rounded-xl bg-[#faf7f2] p-4">
                    <p className="text-xs font-semibold text-[#8b5e3c]">
                      Customer Message
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#684329]">
                      {appointment.message}
                    </p>
                  </div>
                )}

                {appointment.status !== "cancelled" && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eee5dc] pt-5">
                    {appointment.status !== "confirmed" && (
                      <button
                        onClick={() =>
                          updateStatus(appointment._id, "confirmed")
                        }
                        disabled={updatingId === appointment._id}
                        className="rounded-lg bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#684329] disabled:opacity-50"
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "Confirm Appointment"}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        updateStatus(appointment._id, "cancelled")
                      }
                      disabled={updatingId === appointment._id}
                      className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminAppointmentsContent />
    </RoleGuard>
  );
}
