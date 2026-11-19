
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

interface Appointment {
  _id: string;
  serviceId: { serviceName?: string } | string;
  appointmentDate: string;
  timeSlot: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
}

interface Transaction {
  _id: string;
  appointmentId: Appointment | string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentResponse, transactionResponse] = await Promise.all([
        authenticatedFetch("/api/appointments/my"),
        authenticatedFetch("/api/payments/my-transactions"),
      ]);

      const appointmentResult = await appointmentResponse.json();
      const transactionResult = await transactionResponse.json();

      if (!appointmentResponse.ok) {
        throw new Error(appointmentResult.message || "Could not load appointments.");
      }

      if (!transactionResponse.ok) {
        throw new Error(transactionResult.message || "Could not load payment history.");
      }

      setAppointments(appointmentResult.data || []);
      setTransactions(transactionResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startPayment = async (id: string) => {
    try {
      setPaying(true);
      setError("");

      const response = await authenticatedFetch(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ appointmentId: id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not start payment.");
      }

      if (!result.data?.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }

      window.location.assign(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be started.");
      setPaying(false);
    }
  };

  const selectedAppointment = appointments.find(
    (item) => item._id === appointmentId
  );

  const serviceName = (appointment: Appointment | string | null) => {
    if (!appointment || typeof appointment === "string") {
      return "Salon Service";
    }

    return typeof appointment.serviceId === "object"
      ? appointment.serviceId.serviceName || "Salon Service"
      : "Salon Service";
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-bold text-[#684329]">My Payments</h1>
        <p className="mt-2 text-[#8b8178]">
          View your payment history and pay confirmed appointments.
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {appointmentId && (
          <section className="mt-7 rounded-2xl border border-[#e9dfd4] bg-white p-6">
            <h2 className="text-xl font-bold text-[#684329]">
              Appointment Payment
            </h2>

            {loading ? (
              <p className="mt-3 text-sm text-[#8b8178]">
                Checking appointment...
              </p>
            ) : !selectedAppointment ? (
              <p className="mt-3 text-sm text-red-600">
                Appointment not found. Please check your appointment list.
              </p>
            ) : (
              <>
                <h3 className="mt-4 font-semibold text-[#8b5e3c]">
                  {serviceName(selectedAppointment)}
                </h3>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-[#8b8178]">Date</p>
                    <p className="mt-1 font-semibold">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Time</p>
                    <p className="mt-1 font-semibold">
                      {selectedAppointment.timeSlot}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8b8178]">Amount</p>
                    <p className="mt-1 font-semibold">
                      ৳{selectedAppointment.servicePrice}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#8b8178]">
                  Appointment status: {selectedAppointment.status} | Payment: {selectedAppointment.paymentStatus}
                </p>

                <button
                  onClick={() => startPayment(selectedAppointment._id)}
                  disabled={
                    paying ||
                    selectedAppointment.status !== "confirmed" ||
                    selectedAppointment.paymentStatus !== "unpaid"
                  }
                  className="mt-5 rounded-lg bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#684329] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying ? "Redirecting to Stripe..." : "Pay with Stripe"}
                </button>
              </>
            )}
          </section>
        )}

        <h2 className="mb-5 mt-10 text-xl font-bold text-[#684329]">
          Payment History
        </h2>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            Loading payment history...
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
            No payment records found.
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((item) => {
              const linkedAppointment =
                item.appointmentId && typeof item.appointmentId === "object"
                  ? item.appointmentId
                  : null;

              return (
                <article
                  key={item._id}
                  className="rounded-2xl border border-[#e9dfd4] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#684329]">
                        {serviceName(item.appointmentId)}
                      </h3>
                      <p className="mt-1 break-all text-xs text-[#8b8178]">
                        Transaction: {item._id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-[#8b8178]">Amount</p>
                      <p className="mt-1 font-bold">
                        ৳{item.amount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#8b8178]">Currency</p>
                      <p className="mt-1 uppercase">{item.currency}</p>
                    </div>

                    <div>
                      <p className="text-[#8b8178]">Date</p>
                      <p className="mt-1">
                        {new Date(item.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>

                  {linkedAppointment &&
                    linkedAppointment.status === "confirmed" &&
                    linkedAppointment.paymentStatus === "unpaid" && (
                      <button
                        onClick={() => startPayment(linkedAppointment._id)}
                        disabled={paying || !linkedAppointment._id}
                        className="mt-4 rounded-lg bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Pay Now
                      </button>
                    )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <RoleGuard allowedRole="customer">
      <Suspense fallback={<div className="p-10 text-center">Loading payments...</div>}>
        <PaymentsContent />
      </Suspense>
    </RoleGuard>
  );
}
