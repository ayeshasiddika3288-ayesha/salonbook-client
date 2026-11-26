"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";
import { isBlockedUser } from "@/lib/auth-routing";

interface UserWithRole {
  role?: string;
}

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as (UserWithRole & {
    isBlocked?: boolean;
  }) | undefined;
  const role = user?.role;
  const isBlocked = isBlockedUser(user);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    if (isBlocked) {
      void signOut();
      router.replace("/auth/login");
      return;
    }

    if (role === "admin") {
      router.replace("/dashboard/admin");
    } else if (role === "customer") {
      router.replace("/dashboard/customer");
    } else {
      router.replace("/auth/login");
    }
  }, [session, isPending, isBlocked, role, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
      <p className="text-lg font-medium text-[#9b6b43]">
        Redirecting to your dashboard...
      </p>
    </main>
  );
}
