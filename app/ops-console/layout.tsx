"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PlatformAdminGuard from "@/components/platform-admin/PlatformAdminGuard";
import AdminShell from "@/components/platform-admin/AdminShell";

type Props = {
  children: ReactNode;
};

export default function OpsConsoleLayout({ children }: Props) {
  const pathname = usePathname();

  // Standalone auth pages that should not have the AdminShell navigation drawer
  const isAuthPage =
    pathname === "/ops-console" ||
    pathname === "/ops-console/login" ||
    pathname === "/ops-console/change-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <PlatformAdminGuard>
      <AdminShell>{children}</AdminShell>
    </PlatformAdminGuard>
  );
}
