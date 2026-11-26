"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authenticatedFetch, authenticatedFetchJson } from "@/lib/api";

interface ServiceInfo {
  serviceName?: string;
  category?: string;
  image?: string;
}

interface CustomerInfo {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
}

type CustomerRef = CustomerInfo | string | null;

interface Appointment {
  _id: string;
  customerId: CustomerRef;
  serviceId: ServiceInfo | string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

type PendingAction = {
  appointment: Appointment;
  status: "confirmed" | "cancelled";
};

function AdminAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const loadAppointments = () =>
    authenticatedFetchJson<{ data?: Appointment[] }>("/api/appointments").then(
      (result) => result.data || []
    );

  const showError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Could not load appointments.";

    setError(message);
    toast.error(message);
  };

  const refreshAppointments = async () => {
    const data = await loadAppointments();

    setError("");
    setAppointments(data);
  };

  useEffect(() => {
    loadAppointments()
      .then((data) => {
        setError("");
        setAppointments(data);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError("");

    loadAppointments()
      .then((data) => setAppointments(data))
      .catch(showError)
      .finally(() => setLoading(false));
  };

  const updateStatus = async () => {
    if (!pendingAction) return;

    const { appointment, status } = pendingAction;
    const action = status === "confirmed" ? "confirm" : "cancel";

    try {
      setUpdatingId(appointment._id);

      const response = await authenticatedFetch(
        `/api/appointments/${appointment._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update appointment.");
      }

      toast.success(`Appointment ${action}ed successfully.`);
      setPendingAction(null);
      await refreshAppointments();
    } catch (err) {
      toast.error(
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

  const getService = (service: ServiceInfo | string): ServiceInfo =>
    typeof service === "object" && service ? service : {};

  const getCustomer = (customer: CustomerRef): CustomerInfo =>
    typeof customer === "object" && customer ? customer : {};

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a17a50]">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#684329] md:text-4xl">
          Manage Appointments
        </h1>
        <p className="mt-3 text-sm text-[#766e67]">
          Review booking requests and manage customer appointments.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
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
              type="button"
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
          type="button"
          onClick={handleRetry}
          className="rounded-lg border border-[#d8c8b8] px-4 py-2 text-sm font-semibold text-[#684329] hover:bg-white"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-10 text-center text-[#8b8178]">
          Loading appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-10 text-center text-[#8b8178]">
          No {filter === "all" ? "" : filter} appointments found.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAppointments.map((appointment) => {
            const service = getService(appointment.serviceId);
            const customer = getCustomer(appointment.customerId);

            return (
              <article
                key={appointment._id}
                className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.serviceName || "Salon service"}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f4ede4] text-2xl text-[#8b5e3c]">
                        ✂
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8b5e3c]">
                          {service.serviceName || "Salon Service"}
                        </span>
                        {service.category && (
                          <span className="rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold text-[#8b5e3c]">
                            {service.category}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-2 text-lg font-bold text-[#684329]">
                        {customer.name || "Unknown Customer"}
                      </h2>

                      <p className="mt-1 break-all text-xs text-[#8b8178]">
                        {customer.email || "No email on file"}
                        {customer.phone ? ` • ${customer.phone}` : ""}
                      </p>
                    </div>
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
                      ৳{appointment.servicePrice.toLocaleString("en-BD")}
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
                    <p className="text-[#8b8178]">Requested On</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(appointment.createdAt)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-[#8b8178]">Customer ID</p>
                    <p className="mt-1 break-all text-xs font-medium text-[#6b625a]">
                      {customer._id || String(appointment.customerId)}
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
                    {appointment.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            appointment,
                            status: "confirmed",
                          })
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
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          appointment,
                          status: "cancelled",
                        })
                      }
                      disabled={updatingId === appointment._id}
                      className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.status === "confirmed"
            ? "Confirm this appointment?"
            : "Cancel this appointment?"
        }
        description={
          pendingAction?.status === "confirmed"
            ? "The customer will be able to pay for this appointment after confirmation."
            : "The appointment will be cancelled and its time slot released."
        }
        confirmLabel={
          pendingAction?.status === "confirmed"
            ? "Yes, confirm"
            : "Yes, cancel it"
        }
        destructive={pendingAction?.status === "cancelled"}
        busy={Boolean(updatingId)}
        onConfirm={updateStatus}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

export default function AdminAppointmentsPage() {
  return <AdminAppointmentsContent />;
}
