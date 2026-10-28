"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CloudRain,
  HelpCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSubscriptionAccess } from "@/context/SubscriptionAccessContext";
import { useStudioId } from "@/hooks/useStudioId";
import { cancelSubscription } from "@/lib/api/subscription/subscription";

const CANCEL_REASONS = [
  "Monsoon / Off-season shoot pause",
  "Budget / Pricing considerations",
  "Not using studio features enough",
  "Switching to another tool",
  "Temporary break from photography",
  "Other reason",
];

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const { data: subscription, loading, reload } = useSubscriptionAccess();
  const { studioId } = useStudioId();

  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [feedback, setFeedback] = useState<string>("");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const planName = subscription?.plan_name || (subscription?.is_trial ? "7-Day Free Trial" : "Active Studio Plan");
  const isCancelled = subscription?.status === "cancelled" || cancelled;

  async function handleConfirmCancellation() {
    try {
      setCancelling(true);
      setError(null);
      await cancelSubscription(subscription?.subscription_id, studioId);
      setCancelled(true);
      if (reload) {
        await reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3F61]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/plans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans &amp; Billing
        </Link>
      </div>

      {isCancelled ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10 stroke-[2.2]" />
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Subscription Cancelled
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your Subscription is Cancelled
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 leading-relaxed">
            Your studio subscription has been cancelled. You can reactivate anytime or switch to another plan whenever you are ready.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/subscription-plans"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#07324D] transition"
            >
              <Sparkles className="h-4 w-4" />
              Reactivate or Choose a Plan
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Cancel Subscription
                </h1>
                <p className="text-xs text-slate-500">
                  Manage your subscription status or pause for off-season
                </p>
              </div>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Plan
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {planName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Status: <span className="font-semibold text-slate-700 capitalize">{subscription?.status || "Active"}</span>
                  {subscription?.effective_access_end_at && (
                    <> &bull; Access until {new Date(subscription.effective_access_end_at).toLocaleDateString("en-IN")}</>
                  )}
                </p>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Active
              </span>
            </div>
          </div>

          {/* Monsoon / Off-Season Retention Alternative */}
          <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-[#EBF5FB] via-[#F4F9FD] to-white p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61] text-white">
                <CloudRain className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center rounded-md bg-[#0A3F61]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A3F61]">
                  Off-Season Alternative
                </span>
                <h4 className="mt-1.5 text-base font-bold text-slate-900">
                  Pausing for Monsoon? Keep your galleries live with Studio Vault
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Instead of cancelling, switch to <strong>Studio Vault (₹199/mo)</strong>. Uploads are paused, but all existing client links, albums, and AI face searches stay active 24/7 without losing your branding.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard/subscription-plans?tab=vault"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3F61] hover:underline"
                  >
                    View Studio Vault Option &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Warning Box */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  What happens when you cancel:
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-amber-800 list-disc list-inside">
                  <li>Your subscription will not renew automatically.</li>
                  <li>Access to client CRM, albums, and advanced features will be paused at the end of the current billing cycle.</li>
                  <li>Your data remains safely stored and can be restored anytime upon reactivation.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Reason for Cancellation
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={cancelling}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 focus:border-[#0A3F61] focus:bg-white focus:outline-none transition"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Additional Comments or Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Let us know how we can improve PhotoOS for your studio..."
                rows={3}
                disabled={cancelling}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0A3F61] focus:bg-white focus:outline-none transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push("/dashboard/plans")}
                disabled={cancelling}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep My Subscription
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={cancelling}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Cancellation...
                  </>
                ) : (
                  "Confirm Cancel Subscription"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
