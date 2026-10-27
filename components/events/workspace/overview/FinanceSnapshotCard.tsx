"use client";

interface FinanceSnapshot {
  packageAmount: number;
  advanceAmount: number;
  discount: number;
  balanceAmount: number;
  paymentStatus:
    | "pending"
    | "partial"
    | "paid"
    | "overdue";
  paymentDueDate?: string | null;
}

interface FinanceSnapshotCardProps {
  finance: FinanceSnapshot;
}

const statusStyles: Record<
  FinanceSnapshot["paymentStatus"],
  string
> = {
  pending:
    "bg-amber-100 text-amber-800 border border-amber-200",
  partial:
    "bg-blue-100 text-blue-800 border border-blue-200",
  paid:
    "bg-emerald-100 text-emerald-800 border border-emerald-200",
  overdue:
    "bg-red-100 text-red-800 border border-red-200",
};

const statusLabels: Record<
  FinanceSnapshot["paymentStatus"],
  string
> = {
  pending: "Pending",
  partial: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FinanceSnapshotCard({
  finance,
}: FinanceSnapshotCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Finance Snapshot
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Payment Summary
          </h2>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[finance.paymentStatus]}`}
        >
          {statusLabels[finance.paymentStatus]}
        </span>

      </div>

      <div className="mt-6 space-y-4">

        <FinanceRow
          label="Package Amount"
          value={formatCurrency(finance.packageAmount)}
        />

        <FinanceRow
          label="Advance Received"
          value={formatCurrency(finance.advanceAmount)}
          valueClass="text-emerald-600"
        />

        <FinanceRow
          label="Discount"
          value={formatCurrency(finance.discount)}
        />

        <FinanceRow
          label="Balance Due"
          value={formatCurrency(finance.balanceAmount)}
          valueClass="text-orange-600"
        />

        <FinanceRow
          label="Payment Due"
          value={
            finance.paymentDueDate?.trim()
              ? finance.paymentDueDate
              : "Not specified"
          }
        />

      </div>

    </div>
  );
}

interface FinanceRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

function FinanceRow({
  label,
  value,
  valueClass,
}: FinanceRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-none last:pb-0">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`font-semibold text-slate-900 ${
          valueClass ?? ""
        }`}
      >
        {value}
      </span>

    </div>
  );
}