"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";
import type { ReactNode } from "react";

interface RoleGuardProps {
  allowedRole: "customer" | "admin";
  children: ReactNode;
}

interface UserWithRole {
  role?: string;
  isBlocked?: boolean;
}

export default function RoleGuard({
  allowedRole,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as UserWithRole | undefined;
  const role = user?.role;
  const isBlocked = user?.isBlocked === true;

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

    if (role === "admin" && allowedRole === "customer") {
      router.replace("/dashboard/admin");
    } else if (role === "customer" && allowedRole === "admin") {
      router.replace("/dashboard/customer");
    } else if (role !== "admin" && role !== "customer") {
      router.replace("/auth/login");
    }
  }, [session, isPending, role, isBlocked, allowedRole, router]);

  if (isPending || !session || isBlocked || role !== allowedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f2]">
        <p className="text-lg font-medium text-[#9b6b43]">
          Checking access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
