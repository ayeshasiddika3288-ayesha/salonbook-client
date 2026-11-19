
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

interface Transaction {
  _id: string;
  customerId: string;
  appointmentId: {
    appointmentDate?: string;
    timeSlot?: string;
    serviceId?: { serviceName?: string } | string;
  } | string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
}

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/payments/transactions");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load transactions.");
      }

      setTransactions(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((item) => item.status === filter);

  const counts = {
    all: transactions.length,
    completed: transactions.filter((item) => item.status === "completed").length,
    pending: transactions.filter((item) => item.status === "pending").length,
    failed: transactions.filter((item) => item.status === "failed").length,
  };

  const serviceName = (appointment: Transaction["appointmentId"]) => {
    if (!appointment || typeof appointment === "string") return "Salon Service";
    const service = appointment.serviceId;
    return typeof service === "object" ? service?.serviceName || "Salon Service" : "Salon Service";
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-widest text-[#8b5e3c]">Administration</p>
            <h1 className="mt-2 text-3xl font-bold text-[#684329]">Transactions</h1>
            <p className="mt-2 text-[#8b8178]">Monitor customer payments and transaction records.</p>
          </div>

          <button onClick={fetchTransactions} className="rounded-lg border border-[#d8c8b8] px-5 py-3 text-sm font-semibold text-[#684329] hover:bg-white">
            Refresh
          </button>
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "All Transactions", value: counts.all },
            { label: "Completed", value: counts.completed },
            { label: "Pending", value: counts.pending },
            { label: "Failed", value: counts.failed },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#8b8178]">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#684329]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="my-7 flex flex-wrap gap-2">
          {["all", "completed", "pending", "failed", "refunded"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                filter === status
                  ? "bg-[#8b5e3c] text-white"
                  : "border border-[#e9dfd4] bg-white text-[#684329]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#e9dfd4] bg-white shadow-sm">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f5eee7] text-[#684329]">
                <tr>
                  <th className="p-4">Service</th>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Appointment</th>
                  <th className="p-4">Transaction Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="border-t border-[#eee5dc]">
                    <td className="p-4 font-semibold text-[#684329]">{serviceName(item.appointmentId)}</td>
                    <td className="max-w-40 break-all p-4 text-xs">{item.customerId}</td>
                    <td className="p-4 font-semibold">৳{item.amount.toLocaleString()}</td>
                    <td className="p-4">
                      {item.appointmentId && typeof item.appointmentId === "object"
                        ? `${item.appointmentId.appointmentDate ? new Date(item.appointmentId.appointmentDate).toLocaleDateString("en-GB") : "—"} ${item.appointmentId.timeSlot || ""}`
                        : "—"}
                    </td>
                    <td className="p-4">{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        item.status === "completed" ? "bg-green-100 text-green-700" :
                        item.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <TransactionsContent />
    </RoleGuard>
  );
}
