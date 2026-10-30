"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Lock, RefreshCw } from "lucide-react";
import { getPlatformAdminSession, type PlatformAdminSession } from "@/lib/api/platform-admin-auth";
import {
  isRouteAllowedForRole,
  normalizeRoleCode,
  ROLE_DEFINITIONS,
  OpsRoleCode,
} from "@/lib/permissions/ops-rbac";

type Props = {
  children: ReactNode;
};

export default function PlatformAdminGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PlatformAdminSession | null>(null);
  const [activeRole, setActiveRole] = useState<OpsRoleCode>("super_admin");
  const [isPermitted, setIsPermitted] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSessionAndPermissions() {
      try {
        const sess = await getPlatformAdminSession();

        if (!mounted) return;

        if (!sess) {
          router.replace("/ops-console/login");
          return;
        }

        if (
          sess.must_change_password &&
          pathname !== "/ops-console/change-password"
        ) {
          router.replace("/ops-console/change-password");
          return;
        }

        setSession(sess);

        // Resolve active role (support preview mode for founder)
        let resolvedRole = normalizeRoleCode(sess.role_code);
        if (typeof window !== "undefined") {
          const previewRole = window.sessionStorage.getItem("photoos_preview_role");
          if (previewRole && sess.role_code === "super_admin") {
            resolvedRole = normalizeRoleCode(previewRole);
          }
        }
        setActiveRole(resolvedRole);

        // Check if route is allowed for role
        const allowed = isRouteAllowedForRole(resolvedRole, pathname);
        setIsPermitted(allowed);
      } catch {
        if (mounted) {
          router.replace("/ops-console/login");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkSessionAndPermissions();

    // Listen for storage events (e.g. role switcher changes)
    const handleStorageChange = () => {
      checkSessionAndPermissions();
    };
    window.addEventListener("photoos_role_changed", handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener("photoos_role_changed", handleStorageChange);
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Checking admin permissions & session...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // If user role does NOT have access to this route
  if (!isPermitted) {
    const roleDef = ROLE_DEFINITIONS[activeRole];
    const isFounderSession = session.role_code === "super_admin";

    const resetPreview = () => {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("photoos_preview_role");
        window.dispatchEvent(new Event("photoos_role_changed"));
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Role Access Restricted / मर्यादित प्रवेश
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Section Access Not Granted
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your current assigned role <strong className="text-slate-900 dark:text-slate-200 font-semibold">{roleDef.name}</strong> ({roleDef.badgeLabel}) does not have permissions to access <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-indigo-600 dark:text-indigo-400 font-mono">{pathname}</code>.
            <br />
            Only designated department personnel or Super Admin (Founder & CEO) can access this module.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={roleDef.defaultPath}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm shadow-indigo-600/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to {roleDef.department} Home
            </Link>

            <Link
              href="/ops-console/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all border border-slate-200 dark:border-slate-700"
            >
              <Home className="w-4 h-4" />
              Overview Dashboard
            </Link>
          </div>

          {isFounderSession && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 mb-2">
                Founder / Super Admin Preview Mode active:
              </div>
              <button
                type="button"
                onClick={resetPreview}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Switch back to Super Admin (Founder & CEO) Master Access
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
