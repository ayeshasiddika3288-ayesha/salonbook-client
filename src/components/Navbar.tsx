"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";

interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "customer" | "admin";
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as UserWithRole | undefined;
  const role = user?.role;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const dashboardHref =
    role === "admin" ? "/dashboard/admin" : "/dashboard/customer";
  const profileHref =
    role === "admin"
      ? "/dashboard/admin/profile"
      : "/dashboard/customer/profile";

  const closeMenus = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      closeMenus();
      toast.success("You have been signed out.");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Could not sign out. Please try again.");
    }
  };

  const initial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.trim().charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9dfd4] bg-[#faf7f2]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          onClick={closeMenus}
          className="text-2xl font-bold tracking-tight text-[#684329]"
        >
          SalonBook
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 text-sm font-medium text-[#29231f] md:flex">
          <Link
            href="/"
            onClick={closeMenus}
            className="transition hover:text-[#8b5e3c]"
          >
            Home
          </Link>

          <Link
            href="/services"
            onClick={closeMenus}
            className="transition hover:text-[#8b5e3c]"
          >
            Services
          </Link>

          {!isPending &&
            (session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-full border border-[#e9dfd4] bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-[#684329] transition hover:border-[#c6a36b]"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ede4] text-sm font-bold text-[#8b5e3c]">
                      {initial}
                    </span>
                  )}
                  <span className="max-w-32 truncate">
                    {user?.name || "My Account"}
                  </span>
                  <span
                    className={`text-xs transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[#e9dfd4] bg-white py-2 shadow-xl"
                  >
                    <div className="border-b border-[#f0e8de] px-4 pb-3 pt-1">
                      <p className="truncate text-sm font-bold text-[#29231f]">
                        {user?.name || "SalonBook User"}
                      </p>
                      <p className="truncate text-xs text-[#766e67]">
                        {user?.email}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8b5e3c]">
                        {role}
                      </span>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={closeMenus}
                      className="block px-4 py-2.5 text-sm text-[#29231f] transition hover:bg-[#faf7f2]"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href={profileHref}
                      onClick={closeMenus}
                      className="block px-4 py-2.5 text-sm text-[#29231f] transition hover:bg-[#faf7f2]"
                    >
                      My Profile
                    </Link>

                    {role === "customer" && (
                      <Link
                        href="/dashboard/customer/appointments"
                        onClick={closeMenus}
                        className="block px-4 py-2.5 text-sm text-[#29231f] transition hover:bg-[#faf7f2]"
                      >
                        My Appointments
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full border-t border-[#f0e8de] px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={closeMenus}
                  className="transition hover:text-[#8b5e3c]"
                >
                  Log In
                </Link>

                <Link
                  href="/auth/register"
                  onClick={closeMenus}
                  className="rounded-lg bg-[#684329] px-4 py-2 text-white transition hover:bg-[#8b5e3c]"
                >
                  Sign Up
                </Link>
              </>
            ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e9dfd4] bg-white text-xl text-[#684329] md:hidden"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-[#e9dfd4] bg-[#faf7f2] px-5 py-4 md:hidden">
          {session && (
            <div className="mb-4 flex items-center gap-3 border-b border-[#e9dfd4] pb-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4ede4] font-bold text-[#8b5e3c]">
                  {initial}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#29231f]">
                  {user?.name || "SalonBook User"}
                </p>
                <p className="truncate text-xs text-[#766e67]">
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/"
              onClick={closeMenus}
              className="rounded-lg px-3 py-2.5 hover:bg-white"
            >
              Home
            </Link>

            <Link
              href="/services"
              onClick={closeMenus}
              className="rounded-lg px-3 py-2.5 hover:bg-white"
            >
              Services
            </Link>

            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-2.5 hover:bg-white"
                >
                  Dashboard
                </Link>

                <Link
                  href={profileHref}
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-2.5 hover:bg-white"
                >
                  My Profile
                </Link>

                {role === "customer" && (
                  <Link
                    href="/dashboard/customer/appointments"
                    onClick={closeMenus}
                    className="rounded-lg px-3 py-2.5 hover:bg-white"
                  >
                    My Appointments
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg bg-red-50 px-3 py-2.5 text-left font-semibold text-red-600 hover:bg-red-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login"
                  onClick={closeMenus}
                  className="rounded-lg border border-[#d8c8b8] px-3 py-2.5 text-center font-semibold text-[#684329] hover:bg-white"
                >
                  Log In
                </Link>

                <Link
                  href="/auth/register"
                  onClick={closeMenus}
                  className="rounded-lg bg-[#684329] px-3 py-2.5 text-center font-semibold text-white hover:bg-[#8b5e3c]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
