"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlatformAdminSession } from "@/lib/api/platform-admin-auth";
import OpsConsoleLoginPage from "./login/page";
import { Loader2 } from "lucide-react";

export default function OpsConsoleRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const session = await getPlatformAdminSession();
        if (!mounted) return;
        if (session) {
          router.replace("/ops-console/dashboard");
          return;
        }
      } catch {
        // Not authenticated yet
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070E17] text-white">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
          <span>Verifying Platform Gateway...</span>
        </div>
      </div>
    );
  }

  return <OpsConsoleLoginPage />;
}
