"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileText,
  Save,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState("5");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Security & Governance Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access control policies, session expiration, two-factor authentication, and IP compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3F61] hover:bg-[#083049] text-white text-sm font-semibold transition shadow-sm"
        >
          <Save className="h-4 w-4" />
          Update Security Policies
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Security configuration successfully updated.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#0A3F61]" />
            Authentication & Two-Factor Enforcement
          </h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">Enforce Mandatory 2FA for All Staff</div>
                <div className="text-xs text-slate-500">
                  Require email OTP verification for every employee and department agent upon login.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0A3F61]" />
            Session Limits & Lockout Parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Session Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
              >
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours (Working Shift)</option>
                <option value="24h">24 Hours (Recommended)</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                value={maxFailedAttempts}
                onChange={(e) => setMaxFailedAttempts(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900">Security Audit Logs</div>
            <div className="text-xs text-slate-500">Inspect immutable forensic event logs and IP records.</div>
          </div>
          <Link
            href="/ops-console/security-logs"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FileText className="h-3.5 w-3.5" />
            Open Logs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
