"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CloudRain,
  Loader2,
  ShieldAlert,
  X,
  CheckCircle2,
} from "lucide-react";
import { cancelSubscription } from "@/lib/api/subscription/subscription";
import { useSubscriptionAccess } from "@/context/SubscriptionAccessContext";
import { useStudioId } from "@/hooks/useStudioId";

type CancelSubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId?: string | null;
  planName?: string | null;
  onSuccess?: () => void;
};

const CANCEL_REASONS = [
  "Monsoon / Off-season shoot pause",
  "Budget / Pricing considerations",
  "Not using studio features enough",
  "Switching to another tool",
  "Temporary break from photography",
  "Other reason",
];

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
  planName = "Current Plan",
  onSuccess,
}: CancelSubscriptionModalProps) {
  const { data: subAccess } = useSubscriptionAccess();
  const { studioId } = useStudioId();
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  if (!isOpen) return null;

  async function handleConfirmCancel() {
    const effectiveSubId = subscriptionId || subAccess?.subscription_id;

    try {
      setCancelling(true);
      setError(null);
      await cancelSubscription(effectiveSubId, studioId);
      setCancelled(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={cancelling}
          className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {cancelled ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
            </div>
            <h3 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
              Subscription Cancelled
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your subscription has been cancelled. You can reactivate anytime from the subscription plans catalog.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="rounded-xl bg-[#0A3F61] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#07324D] transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Icon & Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Cancel Subscription
                </h3>
                <p className="text-xs text-slate-500">
                  Managing: <span className="font-semibold text-slate-700">{planName}</span>
                </p>
              </div>
            </div>

            {/* Retention Offer: Studio Vault Callout */}
            <div className="mt-5 rounded-2xl border border-blue-200 bg-[#F0F7FB] p-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A3F61] text-white">
                  <CloudRain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A3F61]">
                    Entering wedding off-season?
                  </h4>
                  <p className="mt-1 leading-relaxed text-slate-600">
                    Instead of cancelling and losing access, pause cleanly with <strong>Studio Vault (₹199/mo)</strong>. Keep all existing client galleries, QR downloads, and AI face matching 100% active with zero deletion!
                  </p>
                  <Link
                    href="/dashboard/subscription-plans"
                    onClick={onClose}
                    className="mt-2 inline-flex items-center gap-1 font-bold text-[#0A3F61] hover:underline"
                  >
                    Switch to Studio Vault &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mt-5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reason for cancellation (optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={cancelling}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={cancelling}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                Keep Subscription
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

