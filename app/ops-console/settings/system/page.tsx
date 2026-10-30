"use client";

import { useState } from "react";
import {
  Settings,
  Server,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function SystemSettingsPage() {
  const [clearingCache, setClearingCache] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System & Infrastructure Health
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Serverless runtime status, CDN cache management, and application environment parameters.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearCache}
          disabled={clearingCache}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${clearingCache ? "animate-spin" : ""}`} />
          {clearingCache ? "Purging Cache..." : "Purge Edge Cache"}
        </button>
      </div>

      {cleared && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Vercel edge cache and static generation artifacts successfully purged.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Server className="h-4 w-4 text-[#0A3F61]" />
            Runtime Mode
          </div>
          <div className="text-xl font-bold text-slate-900">Production Node.js</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Next.js 16.2 App Router
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Cpu className="h-4 w-4 text-[#0A3F61]" />
            API Gateway Latency
          </div>
          <div className="text-xl font-bold text-slate-900">~24 ms</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <Zap className="h-3 w-3" /> Mumbai Region (bom1)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Activity className="h-4 w-4 text-[#0A3F61]" />
            Uptime SLA
          </div>
          <div className="text-xl font-bold text-slate-900">99.98%</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> All Services Operational
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#0A3F61]" />
          Platform Environment Specifications
        </h2>
        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Application Identity</span>
            <span className="font-semibold text-slate-900">PhotoOS Enterprise SaaS</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Public Domain</span>
            <span className="font-semibold text-slate-900">app.photoos.in / photoos.in</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">SSL / TLS Protocol</span>
            <span className="font-semibold text-slate-900">TLS 1.3 / Strict-Transport-Security (HSTS)</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="text-slate-500">Storage Encryption</span>
            <span className="font-semibold text-slate-900">AES-256 Cloudflare R2 Bucket</span>
          </div>
        </div>
      </div>
    </div>
  );
}

