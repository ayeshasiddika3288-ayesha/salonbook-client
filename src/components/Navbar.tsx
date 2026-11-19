
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

interface UserWithRole {
  role?: "customer" | "admin";
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as UserWithRole | undefined;
  const role = user?.role;

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9dfd4] bg-[#faf7f2]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-[#684329]"
        >
          SalonBook
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-[#29231f]">
          <Link href="/" className="transition hover:text-[#8b5e3c]">
            Home
          </Link>

          <Link
            href="/services"
            className="transition hover:text-[#8b5e3c]"
          >
            Services
          </Link>

          {!isPending && (
            <>
              {session ? (
                <>
                  {role === "customer" && (
                    <>
                      <Link
                        href="/dashboard/customer"
                        className="transition hover:text-[#8b5e3c]"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/dashboard/customer/profile"
                        className="transition hover:text-[#8b5e3c]"
                      >
                        My Profile
                      </Link>
                    </>
                  )}

                  {role === "admin" && (
                    <Link
                      href="/dashboard/admin"
                      className="transition hover:text-[#8b5e3c]"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg bg-[#684329] px-4 py-2 text-white transition hover:bg-[#8b5e3c]"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="transition hover:text-[#8b5e3c]"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/auth/register"
                    className="rounded-lg bg-[#684329] px-4 py-2 text-white transition hover:bg-[#8b5e3c]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
