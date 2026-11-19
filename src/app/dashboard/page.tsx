"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface UserWithRole {
  role?: string;
}

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as UserWithRole | undefined;
  const role = user?.role;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/auth/login");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    } else if (role === "customer") {
      router.replace("/dashboard/customer");
    } else {
      router.replace("/auth/login");
    }
  }, [session, isPending, role, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
      <p className="text-lg font-medium text-[#9b6b43]">
        Redirecting to your dashboard...
      </p>
    </main>
  );
}
