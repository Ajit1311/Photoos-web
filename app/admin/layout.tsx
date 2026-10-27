"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PlatformAdminGuard from "@/components/platform-admin/PlatformAdminGuard";
import AdminShell from "@/components/platform-admin/AdminShell";

type Props = {
  children: ReactNode;
};

export default function PlatformAdminLayout({ children }: Props) {
  const pathname = usePathname();

  const standalone =
    pathname === "/admin/login" ||
    pathname === "/admin/change-password";

  if (standalone) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        {children}
      </div>
    );
  }

  return (
    <PlatformAdminGuard>
      <AdminShell>{children}</AdminShell>
    </PlatformAdminGuard>
  );
}
