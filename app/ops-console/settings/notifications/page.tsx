"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function NotificationsSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [failedPaymentAlerts, setFailedPaymentAlerts] = useState(true);
  const [newStudioAlerts, setNewStudioAlerts] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("adskartmedia11@gmail.com");
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
            Notification Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system alerts, administrative broadcasts, and incident delivery channels.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3F61] hover:bg-[#083049] text-white text-sm font-semibold transition shadow-sm"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Notification preferences updated successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#0A3F61]" />
            Primary Administrative Dispatch Email
          </h2>
          <p className="text-xs text-slate-500">
            All high-priority operational and security events will be delivered to this inbox.
          </p>
          <div className="max-w-md">
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A3F61]/20 focus:border-[#0A3F61]"
            />
          </div>
        </div>

        <div className="p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0A3F61]" />
            System Alert Channels
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">Security & 2FA Dispatches</div>
                <div className="text-xs text-slate-500">
                  Instant alerts for admin logins, 2FA OTPs, password changes, and brute-force attempts.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newStudioAlerts}
                onChange={(e) => setNewStudioAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">New Studio Onboarding Alerts</div>
                <div className="text-xs text-slate-500">
                  Notify when a new photography studio activates a free trial or subscription.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={failedPaymentAlerts}
                onChange={(e) => setFailedPaymentAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">Payment & Renewal Failures</div>
                <div className="text-xs text-slate-500">
                  Alert support and billing teams immediately upon transaction rejection or webhook failure.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">Daily Executive Digest</div>
                <div className="text-xs text-slate-500">
                  Receive a daily summary of platform activity, storage usage, and customer enquiries.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
