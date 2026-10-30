"use client";

import { useState } from "react";
import {
  CreditCard,
  Building,
  Save,
  CheckCircle2,
  Lock,
  Receipt,
  AlertTriangle,
} from "lucide-react";

export default function PaymentsSettingsPage() {
  const [gatewayMode, setGatewayMode] = useState<"live" | "test">("live");
  const [currency, setCurrency] = useState("INR (₹)");
  const [gstin, setGstin] = useState("27AABCP1234F1Z8");
  const [taxPercent, setTaxPercent] = useState("18");
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
            Payment & Billing Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage payment gateways, invoicing currency, GST tax rates, and settlement payouts.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3F61] hover:bg-[#083049] text-white text-sm font-semibold transition shadow-sm"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Payment gateway configurations saved.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0A3F61]" />
            Gateway Status & Environment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Environment Mode
              </label>
              <select
                value={gatewayMode}
                onChange={(e) => setGatewayMode(e.target.value as "live" | "test")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
              >
                <option value="live">Production (Live Webhooks)</option>
                <option value="test">Sandbox / Testing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billing Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#0A3F61]" />
            Taxation & Statutory Invoicing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered GSTIN
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SaaS GST Rate (%)
              </label>
              <input
                type="text"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-amber-50/50 rounded-b-2xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Security Note:</span> Payment API keys and secret webhook signing secrets are securely injected via production environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

