"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";

import type {
PaymentTransaction,
  RefundPaymentInput,
  PaymentRefundSummary
} from "@/types/payment";

type PaymentRefundModalProps = {
  open: boolean;
  payment: PaymentTransaction | null;
  refundSummary?: PaymentRefundSummary | null;
  onClose: () => void;
  onSubmit: (
    input: RefundPaymentInput,
  ) => Promise<void>;
};

const REFUND_METHODS = [
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "upi",
    label: "UPI",
  },
  {
    value: "net_banking",
    label: "Net Banking",
  },
  {
    value: "debit_card",
    label: "Debit Card",
  },
  {
    value: "credit_card",
    label: "Credit Card",
  },
  {
    value: "phonepe",
    label: "PhonePe",
  },
  {
    value: "google_pay",
    label: "Google Pay",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
  },
] as const;

type RefundMethod =
  (typeof REFUND_METHODS)[number]["value"];

function getPaymentAmount(
  payment: PaymentTransaction | null,
): number {
  if (!payment) {
    return 0;
  }

  return Number(
    payment?.amount ?? 0,
  );
}

export function PaymentRefundModal({
  open,
  payment,
  refundSummary,
  onClose,
  onSubmit,
}: PaymentRefundModalProps) {

  const safePaymentAmount =
    payment?.amount ?? 0;


  const remainingRefundableAmount =
    refundSummary?.remaining_refundable_amount ??
    Number(payment?.amount ?? 0);

  const totalRefundedAmount =
    refundSummary?.total_refunded_amount ?? 0;

  const canRefund =
    refundSummary?.can_refund ?? true;

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    refundMethod,
    setRefundMethod,
  ] =
    useState<RefundMethod>(
      "cash",
    );

  const [
    reference,
    setReference,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      const paymentAmount =
      remainingRefundableAmount;

      setAmount(
        paymentAmount > 0
          ? String(
              paymentAmount,
            )
          : "",
      );

      setReason("");
      setRefundMethod("cash");
      setReference("");
      setNotes("");
      setError(null);
    },
    [
      open,
      payment,
    ],
  );

  if (!open) {
    return null;
  }

  const paymentAmount =
      remainingRefundableAmount;

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!payment) {
        setError(
          "Payment information is missing.",
        );

        return;
      }

      const refundAmount =
        Number(
          amount,
        );

      if (
        !Number.isFinite(
          refundAmount,
        ) ||
        refundAmount <= 0
      ) {
        setError(
          "Enter a valid refund amount.",
        );

        return;
      }

      if (
        paymentAmount > 0 &&
        refundAmount > paymentAmount
      ) {
        setError(
          `Refund amount cannot exceed ${paymentAmount}.`,
        );

        return;
      }

      if (
        !reason.trim()
      ) {
        setError(
          "Refund reason is required.",
        );

        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        await onSubmit({
          paymentId:
            payment.id,
          amount:
            refundAmount,
          reason:
            reason.trim(),
          refundMethod,
          transactionReference:
            reference.trim() ||
            null,
          notes:
            notes.trim() ||
            null,
        });

        onClose();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to process refund.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        px-4
      "
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-background
          shadow-2xl
        "
      >
        <div
          className="
            flex items-center
            justify-between
            border-b
            border-border
            px-6 py-5
          "
        >
          <div>
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <div
                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-destructive/10
                  text-destructive
                "
              >
                <RotateCcw
                  className="h-4 w-4"
                />
              </div>

              <div>
                <h2
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  Process Refund
                </h2>

                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >
                  Record the refund and
                  payment method.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              rounded-lg
              p-2
              text-muted-foreground
              transition
              hover:bg-muted
              hover:text-foreground
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close refund form"
          >
            <X
              className="h-5 w-5"
            />
          </button>
        </div>
      <div className="mb-4 rounded-lg border p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span>Total refunded</span>
          <span className="font-medium">
            {payment?.currency ?? "INR"} {totalRefundedAmount.toFixed(2)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <span>Remaining refundable amount</span>
          <span className="font-semibold">
            {payment?.currency ?? "INR"} {remainingRefundableAmount.toFixed(2)}
          </span>
        </div>

        {!canRefund && (
          <p className="mt-3 text-sm">
            This payment cannot be refunded further.
          </p>
        )}
      </div>


        <form
          onSubmit={handleSubmit}
          className="
            space-y-5
            px-6 py-6
          "
        >
          <div
            className="
              rounded-xl
              border
              border-border
              bg-muted/30
              p-4
            "
          >
            <div
              className="
                flex items-center
                justify-between
                gap-4
              "
            >
              <span
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Original Payment
              </span>

              <span
                className="
                  font-semibold
                "
              >
                ₹
                {paymentAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}
              </span>
            </div>

            {payment?.paymentNumber ? (
              <p
                className="
                  mt-2
                  text-xs
                  text-muted-foreground
                "
              >
                Payment #
                {payment.paymentNumber}
              </p>
            ) : null}
          </div>

          <div
            className="space-y-2"
          >
            <label
              htmlFor="refund-amount"
              className="
                text-sm
                font-medium
              "
            >
              Refund Amount
            </label>

            <input
              id="refund-amount"
              type="number"
              min="0"
              max={
                paymentAmount > 0
                  ? paymentAmount
                  : undefined
              }
              step="0.01"
              value={amount}
              onChange={(
                event,
              ) => {
                setAmount(
                  event.target.value,
                );
              }}
              disabled={submitting}
              className="
                flex h-11 w-full
                rounded-lg
                border border-input
                bg-background
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              placeholder="Enter refund amount"
              required
            />
          </div>

          <div
            className="space-y-2"
          >
            <label
              htmlFor="refund-reason"
              className="
                text-sm
                font-medium
              "
            >
              Refund Reason
            </label>

            <textarea
              id="refund-reason"
              value={reason}
              onChange={(
                event,
              ) => {
                setReason(
                  event.target.value,
                );
              }}
              disabled={submitting}
              className="
                min-h-24
                w-full
                rounded-lg
                border border-input
                bg-background
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              placeholder="Explain why this refund is being issued"
              required
            />
          </div>

          <div
            className="space-y-2"
          >
            <label
              htmlFor="refund-method"
              className="
                text-sm
                font-medium
              "
            >
              Refund Method
            </label>

            <select
              id="refund-method"
              value={refundMethod}
              onChange={(
                event,
              ) => {
                setRefundMethod(
                  event.target
                    .value as RefundMethod,
                );
              }}
              disabled={submitting}
              className="
                flex h-11 w-full
                rounded-lg
                border border-input
                bg-background
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {REFUND_METHODS.map(
                (
                  method,
                ) => (
                  <option
                    key={
                      method.value
                    }
                    value={
                      method.value
                    }
                  >
                    {
                      method.label
                    }
                  </option>
                ),
              )}
            </select>

            <p
              className="
                text-xs
                text-muted-foreground
              "
            >
              PhonePe and other
              gateways can be connected
              later. For now, the selected
              method is recorded with the
              refund.
            </p>
          </div>

          <div
            className="space-y-2"
          >
            <label
              htmlFor="refund-reference"
              className="
                text-sm
                font-medium
              "
            >
              Transaction Reference
              <span
                className="
                  ml-1
                  text-muted-foreground
                "
              >
                optional
              </span>
            </label>

            <input
              id="refund-reference"
              type="text"
              value={reference}
              onChange={(
                event,
              ) => {
                setReference(
                  event.target.value,
                );
              }}
              disabled={submitting}
              className="
                flex h-11 w-full
                rounded-lg
                border border-input
                bg-background
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              placeholder="UPI / gateway / bank reference"
            />
          </div>

          <div
            className="space-y-2"
          >
            <label
              htmlFor="refund-notes"
              className="
                text-sm
                font-medium
              "
            >
              Internal Notes
              <span
                className="
                  ml-1
                  text-muted-foreground
                "
              >
                optional
              </span>
            </label>

            <textarea
              id="refund-notes"
              value={notes}
              onChange={(
                event,
              ) => {
                setNotes(
                  event.target.value,
                );
              }}
              disabled={submitting}
              className="
                min-h-20
                w-full
                rounded-lg
                border border-input
                bg-background
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              placeholder="Additional internal information"
            />
          </div>

          {error ? (
            <div
              className="
                rounded-lg
                border
                border-destructive/30
                bg-destructive/10
                px-3 py-2
                text-sm
                text-destructive
              "
            >
              {error}
            </div>
          ) : null}

          <div
            className="
              flex flex-col-reverse
              gap-3
              pt-2
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                inline-flex h-11
                items-center
                justify-center
                rounded-lg
                border border-input
                px-5
                text-sm
                font-medium
                transition
                hover:bg-muted
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex h-11
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-destructive
                px-5
                text-sm
                font-medium
                text-destructive-foreground
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? (
                <>
                  <Loader2
                    className="
                      h-4 w-4
                      animate-spin
                    "
                  />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw
                    className="
                      h-4 w-4
                    "
                  />
                  Process Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
