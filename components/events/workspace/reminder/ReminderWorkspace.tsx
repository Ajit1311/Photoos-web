"use client";
import { useSearchParams } from "next/navigation";


import {
  AlertCircle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  Phone,
  UserRound,
} from "lucide-react";

import {
  useWorkspace,
} from "@/hooks/events/useWorkspace";

interface ReminderWorkspaceProps {
  eventId: string;
}

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value,
    )
      ? value
      : 0;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(value);

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function formatDate(
  value:
    | string
    | null
    | undefined,
): string {
  if (
    !value ||
    !value.trim()
  ) {
    return "Not set";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function normalizeString(
  value: unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed ||
    null;
}

export default function ReminderWorkspace({
  eventId,
}: ReminderWorkspaceProps) {

  const searchParams =
    useSearchParams();

  const reminderId =
    searchParams.get(
      "reminderId",
    );

  const followUpId =
    searchParams.get(
      "followUpId",
    );

  const {
    loading,
    workspace,
    error,
    refresh,
  } =
    useWorkspace(
      eventId,
    );

  if (
    loading
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />

          <div className="h-28 rounded-2xl bg-slate-100" />

          <div className="h-28 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (
    error
  ) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-100 p-3 text-red-600">
            <AlertCircle
              className="h-6 w-6"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-red-900">
              Unable to load reminders
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error.message}
            </p>

            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !workspace
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <BellRing className="mx-auto h-10 w-10 text-slate-300" />

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Reminder data unavailable
        </h2>
      </div>
    );
  }

  const client =
    workspace.client;

  const finance =
    workspace.finance;

  const event =
    workspace.event;

  const packageAmount =
    toNumber(
      finance?.package_amount,
    );

  const advanceAmount =
    toNumber(
      finance?.advance_amount,
    );

  const balanceAmount =
    toNumber(
      finance?.balance_amount,
    );

  const paymentStatus =
    normalizeString(
      finance?.payment_status,
    ) ??
    "pending";

  const paymentDueDate =
    normalizeString(
      finance?.payment_due_date,
    );

  const clientFirstName =
    normalizeString(
      client?.["first_name"],
    );

  const clientLastName =
    normalizeString(
      client?.["last_name"],
    );

  const clientDisplayName =
    [
      clientFirstName,
      clientLastName,
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      ) ||
    normalizeString(
      client?.["name"],
    ) ||
    normalizeString(
      client?.["display_name"],
    ) ||
    "Client";

  const clientPhone =
    normalizeString(
      client?.["phone"],
    ) ||
    normalizeString(
      client?.["mobile"],
    ) ||
    normalizeString(
      client?.["phone_number"],
    );

  const hasDueAmount =
    balanceAmount >
    0;

  const normalizedStatus =
    paymentStatus
      .toLowerCase()
      .trim();

  const isOverdue =
    normalizedStatus ===
      "overdue" ||
    (
      paymentDueDate &&
      new Date(
        paymentDueDate,
      ).getTime() <
        new Date().setHours(
          0,
          0,
          0,
          0,
        )
    );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
                <BellRing className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Payment Reminder
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Payment due reminders for this event client.
                </p>
              </div>
            </div>
          </div>

          {hasDueAmount ? (
            <div
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ${
                isOverdue
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <AlertCircle className="h-4 w-4" />

              {isOverdue
                ? "Payment overdue"
                : "Payment pending"}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />

              No payment due
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Client Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Client associated with this event.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Client Name
              </p>

              <p className="mt-2 text-base font-semibold text-slate-900">
                {clientDisplayName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-wide">
                  Phone Number
                </p>
              </div>

              <p className="mt-2 text-base font-semibold text-slate-900">
                {clientPhone ??
                  "Not available"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <p className="mt-2 text-base font-semibold text-slate-900">
              {event.name ??
                "Untitled Event"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Amount Due
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Outstanding balance
              </p>
            </div>
          </div>

          <p
            className={`mt-8 text-3xl font-bold ${
              hasDueAmount
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {formatCurrency(
              balanceAmount,
            )}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Payment Status
              </span>

              <span className="font-semibold capitalize text-slate-900">
                {paymentStatus.replaceAll(
                  "_",
                  " ",
                )}
              </span>
            </div>
          </div>
        </section>
      </div>

      {hasDueAmount ? (
        <section
          className={`rounded-3xl border p-6 shadow-sm ${
            isOverdue
              ? "border-red-200 bg-red-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`rounded-2xl p-3 ${
                  isOverdue
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                <BellRing className="h-6 w-6" />
              </div>

              <div>
                <h2
                  className={`text-lg font-bold ${
                    isOverdue
                      ? "text-red-900"
                      : "text-amber-900"
                  }`}
                >
                  {isOverdue
                    ? "Payment reminder is overdue"
                    : "Payment reminder"}
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    isOverdue
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                >
                  {clientDisplayName} has an outstanding amount of{" "}
                  <strong>
                    {formatCurrency(
                      balanceAmount,
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarClock className="h-4 w-4" />

                <span className="text-xs font-semibold uppercase tracking-wide">
                  Due Date
                </span>
              </div>

              <p className="mt-2 font-bold text-slate-900">
                {formatDate(
                  paymentDueDate,
                )}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-emerald-900">
            No payment reminders
          </h2>

          <p className="mt-2 text-sm text-emerald-700">
            This event currently has no outstanding payment amount.
          </p>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Payment Summary
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Package Amount
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(
                packageAmount,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Received Amount
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-600">
              {formatCurrency(
                advanceAmount,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Balance Amount
            </p>

            <p className="mt-2 text-xl font-bold text-red-600">
              {formatCurrency(
                balanceAmount,
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}