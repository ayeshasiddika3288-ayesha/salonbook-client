"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authenticatedFetch, authenticatedFetchJson } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  role: string;
  isBlocked: boolean;
  createdAt?: string | null;
}

function AdminCustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [blockTarget, setBlockTarget] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  const loadCustomers = () =>
    authenticatedFetchJson<{ data?: Customer[] }>("/api/users").then(
      (result) => result.data || []
    );

  const showError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Could not load customers.";

    setError(message);
    toast.error(message);
  };

  const refreshCustomers = async () => {
    const data = await loadCustomers();

    setError("");
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers()
      .then((data) => {
        setError("");
        setCustomers(data);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError("");

    loadCustomers()
      .then((data) => setCustomers(data))
      .catch(showError)
      .finally(() => setLoading(false));
  };

  const confirmToggleBlock = async () => {
    if (!blockTarget) return;

    const customer = blockTarget;
    const action = customer.isBlocked ? "unblock" : "block";

    try {
      setUpdatingId(customer._id);
      setError("");

      const response = await authenticatedFetch(
        `/api/users/${customer._id}/${action}`,
        { method: "PATCH" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update customer.");
      }

      toast.success(
        customer.isBlocked
          ? "Customer unblocked successfully."
          : "Customer blocked successfully."
      );

      setBlockTarget(null);
      await refreshCustomers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const blockedCount = customers.filter(
    (customer) => customer.isBlocked
  ).length;

  return (
    <div>
      <main>
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a17a50]">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#684329] md:text-4xl">
            Manage Customers
          </h1>
          <p className="mt-3 text-sm text-[#766e67]">
            Review registered customers and block or unblock accounts.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b8178]">Total Customers</p>
            <p className="mt-2 text-3xl font-bold text-[#684329]">
              {loading ? "—" : customers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b8178]">Blocked Accounts</p>
            <p className="mt-2 text-3xl font-bold text-[#b91c1c]">
              {loading ? "—" : blockedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9dfd4] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#8b8178]">Active Accounts</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {loading ? "—" : customers.length - blockedCount}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full max-w-md rounded-xl border border-[#e5dbcf] bg-white px-4 py-3 text-sm outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/10"
          />

          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg border border-[#d8c8b8] px-4 py-2 text-sm font-semibold text-[#684329] hover:bg-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#8b8178]">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#e9dfd4] bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#f5eee7] text-[#684329]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-t border-[#eee5dc]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {customer.image ? (
                          <img
                            src={customer.image}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ede4] font-bold text-[#8b5e3c]">
                            {customer.name?.charAt(0)?.toUpperCase() || "C"}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-[#684329]">
                            {customer.name}
                          </p>
                          <p className="break-all text-xs text-[#8b8178]">
                            ID: {customer._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 break-all">{customer.email}</td>

                    <td className="p-4">{customer.phone || "—"}</td>

                    <td className="p-4">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          customer.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {customer.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setBlockTarget(customer)}
                        disabled={updatingId === customer._id}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50 ${
                          customer.isBlocked
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {updatingId === customer._id
                          ? "Updating..."
                          : customer.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title={
          blockTarget?.isBlocked
            ? "Unblock this customer?"
            : "Block this customer?"
        }
        description={
          blockTarget?.isBlocked
            ? `${blockTarget?.name} will be able to sign in and book appointments again.`
            : `${blockTarget?.name} will be signed out immediately and will no longer be able to book appointments.`
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock" : "Block"}
        destructive={!blockTarget?.isBlocked}
        busy={Boolean(updatingId)}
        onConfirm={confirmToggleBlock}
        onCancel={() => setBlockTarget(null)}
      />
    </div>
  );
}

export default function AdminCustomersPage() {
  return <AdminCustomersContent />;
}
