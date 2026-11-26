"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authenticatedFetchJson } from "@/lib/api";

interface CustomerInfo {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

type CustomerRef = CustomerInfo | string | null;

interface Transaction {
  _id: string;
  customerId: CustomerRef;
  appointmentId: {
    appointmentDate?: string;
    timeSlot?: string;
    serviceId?: { serviceName?: string } | string;
  } | string | null;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string | null;
  createdAt: string;
}

const normalizeStatus = (status: string) =>
  status === "paid" || status === "completed" ? "paid" : "failed";

const shortReference = (value?: string | null) => {
  if (!value) return "—";

  return value.length > 18
    ? `${value.slice(0, 12)}…${value.slice(-6)}`
    : value;
};

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadTransactions = () =>
    authenticatedFetchJson<{ data?: Transaction[] }>(
      "/api/payments/transactions"
    ).then((result) => result.data || []);

  const showError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Could not load transactions.";

    setError(message);
    toast.error(message);
  };

  useEffect(() => {
    loadTransactions()
      .then((data) => {
        setError("");
        setTransactions(data);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError("");

    loadTransactions()
      .then((data) => setTransactions(data))
      .catch(showError)
      .finally(() => setLoading(false));
  };

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter(
          (item) => normalizeStatus(item.status) === filter
        );

  const counts = {
    all: transactions.length,
    paid: transactions.filter(
      (item) => normalizeStatus(item.status) === "paid"
    ).length,
    failed: transactions.filter(
      (item) => normalizeStatus(item.status) === "failed"
    ).length,
  };

  const serviceName = (appointment: Transaction["appointmentId"]) => {
    if (!appointment || typeof appointment === "string") {
      return "Salon Service";
    }
    const service = appointment.serviceId;
    return typeof service === "object"
      ? service?.serviceName || "Salon Service"
      : "Salon Service";
  };

  const getCustomer = (customer: CustomerRef): CustomerInfo =>
    typeof customer === "object" && customer ? customer : {};

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a17a50]">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#684329]">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-[#766e67]">
            Monitor customer payments and transaction records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg border border-[#d8c8b8] px-5 py-3 text-sm font-semibold text-[#684329] hover:bg-white"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: "All Transactions", value: counts.all },
          { label: "Paid", value: counts.paid },
          { label: "Failed", value: counts.failed },
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

      <div className="my-7 flex flex-wrap gap-2">
        {["all", "paid", "failed"].map((status) => (
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

      {loading ? (
        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-10 text-center">
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-10 text-center text-[#8b8178]">
          No transactions found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e9dfd4] bg-white shadow-sm">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#f5eee7] text-[#684329]">
              <tr>
                <th className="p-4">Service</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Appointment</th>
                <th className="p-4">Stripe Reference</th>
                <th className="p-4">Transaction Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const customer = getCustomer(item.customerId);
                const status = normalizeStatus(item.status);

                return (
                  <tr key={item._id} className="border-t border-[#eee5dc]">
                    <td className="p-4 font-semibold text-[#684329]">
                      {serviceName(item.appointmentId)}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-[#29231f]">
                        {customer.name || "Unknown Customer"}
                      </p>
                      <p className="break-all text-xs text-[#8b8178]">
                        {customer.email || "—"}
                      </p>
                      {customer.phone && (
                        <p className="text-xs text-[#8b8178]">
                          {customer.phone}
                        </p>
                      )}
                    </td>

                    <td className="p-4 font-semibold">
                      ৳{item.amount.toLocaleString("en-BD")}
                    </td>

                    <td className="p-4">
                      {item.appointmentId &&
                      typeof item.appointmentId === "object"
                        ? `${
                            item.appointmentId.appointmentDate
                              ? new Date(
                                  item.appointmentId.appointmentDate
                                ).toLocaleDateString("en-GB")
                              : "—"
                          } ${item.appointmentId.timeSlot || ""}`
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className="break-all font-mono text-xs text-[#684329]"
                        title={item.stripeSessionId || undefined}
                      >
                        {shortReference(item.stripeSessionId)}
                      </span>
                    </td>

                    <td className="p-4">
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminTransactionsPage() {
  return <TransactionsContent />;
}
