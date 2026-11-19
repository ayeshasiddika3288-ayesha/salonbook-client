"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoleGuard from "@/components/RoleGuard";
import { authenticatedFetch } from "@/lib/api";

interface DashboardStats {
  totalCustomers: number;
  totalServices: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  successfulPayments: {
    count: number;
    totalAmount: number;
  };
}

const adminSections = [
  {
    title: "Manage Services",
    description: "Add, edit, delete and manage salon services.",
    href: "/dashboard/admin/services",
    icon: "✂️",
  },
  {
    title: "Manage Appointments",
    description: "View booking requests and confirm or cancel appointments.",
    href: "/dashboard/admin/appointments",
    icon: "📅",
  },
  {
    title: "Manage Customers",
    description: "View customer accounts and manage blocked users.",
    href: "/dashboard/admin/customers",
    icon: "👥",
  },
  {
    title: "Transactions",
    description: "Review customer payments and transaction history.",
    href: "/dashboard/admin/transactions",
    icon: "💳",
  },
  {
    title: "My Profile",
    description: "Update your admin account name and profile image.",
    href: "/dashboard/admin/profile",
    icon: "👤",
  },
];

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/admin/stats");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not load dashboard statistics."
        );
      }

      setStats(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      label: "Total Registered Customers",
      value: stats?.totalCustomers ?? 0,
      icon: "👥",
    },
    {
      label: "Active Services",
      value: stats?.totalActiveServices ?? 0,
      icon: "✂️",
    },
    {
      label: "Total Appointment Requests",
      value: stats?.totalAppointments ?? 0,
      icon: "📋",
    },
    {
      label: "Pending Appointments",
      value: stats?.pendingAppointments ?? 0,
      icon: "⏳",
    },
    {
      label: "Confirmed Appointments",
      value: stats?.confirmedAppointments ?? 0,
      icon: "✓",
    },
    {
      label: "Successful Payments",
      value: stats?.successfulPayments?.count ?? 0,
      hint: stats
        ? `৳${stats.successfulPayments.totalAmount.toLocaleString("en-BD")} collected`
        : undefined,
      icon: "💳",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-widest text-[#8b5e3c]">
            SalonBook Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#684329] md:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-[#8b8178]">
            Manage salon services, appointments, customers and payments.
          </p>
        </div>

        {error && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchStats}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview statistics */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#8b8178]">
                  {card.label}
                </p>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5eee7] text-xl">
                  {card.icon}
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#684329]">
                {loading ? "—" : card.value}
              </p>
              {card.hint && !loading && (
                <p className="mt-1 text-xs text-[#8b8178]">{card.hint}</p>
              )}
            </div>
          ))}
        </section>

        {/* Management links */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-[#684329]">
            Management
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group rounded-2xl border border-[#e9dfd4] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-4xl">{section.icon}</span>

                <h3 className="mt-5 text-xl font-bold text-[#684329] group-hover:text-[#8b5e3c]">
                  {section.title}
                </h3>

                <p className="mt-2 leading-7 text-[#8b8178]">
                  {section.description}
                </p>

                <span className="mt-5 inline-block font-semibold text-[#8b5e3c]">
                  Open Management →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}
