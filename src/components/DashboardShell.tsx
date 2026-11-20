"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { signOut, useSession } from "@/lib/auth-client";

interface DashboardShellProps {
  children: ReactNode;
}

interface DashboardUser {
  role?: string;
  isBlocked?: boolean;
}

const customerLinks = [
  { label: "Overview", href: "/dashboard/customer", icon: "🏠" },
  {
    label: "My Appointments",
    href: "/dashboard/customer/appointments",
    icon: "📅",
  },
  {
    label: "Payments",
    href: "/dashboard/customer/payments",
    icon: "💳",
  },
  { label: "My Profile", href: "/dashboard/customer/profile", icon: "👤" },
];

const adminLinks = [
  { label: "Overview", href: "/dashboard/admin", icon: "🏠" },
  {
    label: "Manage Services",
    href: "/dashboard/admin/services",
    icon: "✂️",
  },
  {
    label: "Appointments",
    href: "/dashboard/admin/appointments",
    icon: "📅",
  },
  {
    label: "Customers",
    href: "/dashboard/admin/customers",
    icon: "👥",
  },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: "💳",
  },
  { label: "My Profile", href: "/dashboard/admin/profile", icon: "👤" },
];

const isActiveLink = (pathname: string, href: string) => {
  if (href === "/dashboard/customer" || href === "/dashboard/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const user = session?.user as DashboardUser | undefined;
  const role = user?.role;
  const isBlocked = user?.isBlocked === true;

  const area = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/customer")
      ? "customer"
      : null;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`
      );
      return;
    }

    if (isBlocked) {
      void signOut();
      router.replace("/auth/login");
      return;
    }

    if (role !== "admin" && role !== "customer") {
      router.replace("/auth/login");
      return;
    }

    if (area && role !== area) {
      router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
    }
  }, [session, isPending, isBlocked, role, area, pathname, router]);

  if (
    isPending ||
    !session ||
    isBlocked ||
    (role !== "admin" && role !== "customer") ||
    (area !== null && role !== area)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e5dbcf] border-t-[#8b5e3c]" />
          <p className="mt-4 text-sm font-medium text-[#8b5e3c]">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  const links = role === "admin" ? adminLinks : customerLinks;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-5 lg:px-8 lg:py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-[#e9dfd4] bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a17a50]">
              {role === "admin" ? "Administration" : "Customer Area"}
            </p>

            <nav className="space-y-1">
              {links.map((link) => {
                const active = isActiveLink(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-[#8b5e3c] text-white shadow-sm"
                        : "text-[#51453b] hover:bg-[#faf7f2] hover:text-[#684329]"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-[#f0e8de]" />

              <Link
                href="/services"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#51453b] transition hover:bg-[#faf7f2] hover:text-[#684329]"
              >
                <span className="text-base">✨</span>
                Browse Services
              </Link>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile / tablet dashboard navigation */}
          <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {links.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-[#8b5e3c] text-white"
                      : "border border-[#e9dfd4] bg-white text-[#684329]"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
