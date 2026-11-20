"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

interface Appointment {
  status: "pending" | "confirmed" | "cancelled";
}

const menuItems = [
  {
    title: "My Appointments",
    description: "View and manage your salon appointments.",
    icon: "📅",
    href: "/dashboard/customer/appointments",
  },
  {
    title: "Payment History",
    description: "View your previous transactions and payments.",
    icon: "💳",
    href: "/dashboard/customer/payments",
  },
  {
    title: "My Profile",
    description: "Manage your personal account information.",
    icon: "👤",
    href: "/dashboard/customer/profile",
  },
];

function CustomerDashboardContent() {
  const { data: session } = useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authenticatedFetch("/api/appointments/my");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load your dashboard.");
      }

      setAppointments(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const stats = [
    {
      label: "Total Appointment Requests",
      value: appointments.length,
      icon: "📋",
    },
    {
      label: "Pending Appointments",
      value: appointments.filter((item) => item.status === "pending").length,
      icon: "⏳",
    },
    {
      label: "Confirmed Appointments",
      value: appointments.filter((item) => item.status === "confirmed").length,
      icon: "✓",
    },
    {
      label: "Cancelled Appointments",
      value: appointments.filter((item) => item.status === "cancelled").length,
      icon: "✕",
    },
  ];

  return (
    <div>
      <main>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a17a50]">
              Customer Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#29231f]">
              Welcome Back
              {session?.user?.name ? `, ${session.user.name}` : "!"}
            </h1>
            <p className="mt-2 text-sm text-[#766e67]">
              Manage your appointments and enjoy your self-care journey.
            </p>
          </div>

          <Link
            href="/services"
            className="rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#684329]"
          >
            + Book an Appointment
          </Link>
        </div>

        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

        {/* Statistics */}
        <section className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#eee5da] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#766e67]">
                  {stat.label}
                </p>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4ede4] text-xl">
                  {stat.icon}
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#684329]">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Dashboard Menu */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#29231f]">
              Manage Your Account
            </h2>
            <p className="mt-2 text-sm text-[#766e67]">
              Everything you need to manage your salon experience.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-[#eee5da] bg-white p-6 transition hover:-translate-y-1 hover:border-[#c6a36b] hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ede4] text-2xl">
                  {item.icon}
                </span>

                <h3 className="mt-5 text-lg font-semibold text-[#29231f]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#766e67]">
                  {item.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-[#8b5e3c] transition group-hover:translate-x-1">
                  Open Section →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Booking */}
        <section className="mt-10 rounded-3xl bg-[#684329] p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e6c99f]">
            Time for Self-Care
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Your next beauty appointment is waiting.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#eadfd3]">
            Explore our salon services and find the perfect treatment for
            yourself.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-block rounded-full bg-[#e6c99f] px-7 py-3 text-sm font-bold text-[#50341f] transition hover:bg-white"
          >
            Explore Services →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default function CustomerDashboard() {
  return <CustomerDashboardContent />;
}
