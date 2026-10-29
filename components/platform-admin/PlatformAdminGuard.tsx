"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getPlatformAdminSession } from "@/lib/api/platform-admin-auth";

type Props = {
  children: ReactNode;
};

export default function PlatformAdminGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const session = await getPlatformAdminSession();

        if (!mounted) return;

        if (!session) {
          router.replace("/ops-console");
          return;
        }

        if (
          session.must_change_password &&
          pathname !== "/admin/change-password"
        ) {
          router.replace("/admin/change-password");
          return;
        }

        setAuthorized(true);
      } catch {
        if (mounted) {
          router.replace("/ops-console");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="text-sm text-slate-500">
          Checking admin session...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
