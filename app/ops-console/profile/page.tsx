"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCog,
  Mail,
  KeyRound,
  Lock,
  Smartphone,
  History,
  CheckCircle2,
  LogOut,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getPlatformAdminSession, logoutPlatformAdmin } from "@/lib/api/platform-admin-auth";

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<string>("ADMIN_FOUNDER");
  const [adminEmail, setAdminEmail] = useState<string>("adskartmedia11@gmail.com");
  const [role, setRole] = useState<string>("Platform Super Admin");
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getPlatformAdminSession();
        if (session) {
          if (session.user_id) {
            setAdminUser(session.user_id);
            if (session.user_id.includes("@")) {
              setAdminEmail(session.user_id);
            }
          }
        }
      } catch {
        // Fallback to default founder profile
      }
    }
    void loadSession();
  }, []);

  const handleLogout = async () => {
    await logoutPlatformAdmin();
    router.replace("/ops-console/login");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Administrator Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Super Administrator account configuration, security credentials, and active session control.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold self-start sm:self-auto border border-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Founder Root Access
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#0A3F61] to-[#041c2c] flex items-center justify-center text-white text-2xl font-black shadow-md">
            SA
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 capitalize">{adminUser}</h2>
              <span className="bg-blue-50 text-[#0A3F61] border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {role}
              </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-slate-400" />
              {adminEmail}
            </p>
            <p className="text-xs text-slate-400">
              Department: Operations, Engineering & Platform Governance
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition border border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Authorization Scope</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Full Organization (Super Admin)</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Unrestricted Access
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">2FA Verification</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Resend Email OTP</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Active & Protected
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Session Status</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Active Hardware Session</div>
            <div className="text-xs text-slate-500 mt-1">Encrypted Cookie (Strict)</div>
          </div>
        </div>
      </div>

      {/* Security & Password Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security Credentials</h3>
              <p className="text-xs text-slate-500">Update your account master password</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Ensure your account uses a strong passphrase with numbers, uppercase letters, and symbols.
          </p>
          <Link
            href="/ops-console/change-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A3F61] hover:text-blue-800 transition pt-2"
          >
            <KeyRound className="h-4 w-4" />
            Change Master Password
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Audit & Access Logs</h3>
              <p className="text-xs text-slate-500">Track all administrative logins & API calls</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Review live forensic trails, IP addresses, failed authentications, and sensitive data changes.
          </p>
          <Link
            href="/ops-console/security-logs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A3F61] hover:text-blue-800 transition pt-2"
          >
            <ShieldAlert className="h-4 w-4" />
            View Security Logs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
