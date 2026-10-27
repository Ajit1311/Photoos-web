"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  getPlatformAdminIncomeLedger,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function IncomeLedgerPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const limit = 50;

  const query = useQuery({
    queryKey: [
      "platform-admin-income-ledger",
      dateFrom,
      dateTo,
      search,
      status,
      offset,
    ],
    queryFn: () =>
      getPlatformAdminIncomeLedger({
        dateFrom,
        dateTo,
        search,
        status,
        limit,
        offset,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  function applySearch() {
    setOffset(0);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setOffset(0);
  }

  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / limit),
  );

  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">
              Income Ledger
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Transaction-level income ledger from recorded payment transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => query.refetch()}
          className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              query.isFetching ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-xs text-muted-foreground">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setOffset(0);
            }}
            className="bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-xs text-muted-foreground">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setOffset(0);
            }}
            className="bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            placeholder="Search payment, transaction, studio..."
            className="w-full bg-transparent text-sm outline-none"
          />

          <button
            type="button"
            onClick={applySearch}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            Search
          </button>
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          Clear
        </button>
      </div>

      {query.isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          Failed to load Income Ledger.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border bg-card p-5">
          <span className="text-sm text-muted-foreground">
            Transactions
          </span>
          <div className="mt-3 text-2xl font-semibold">
            {summary?.transaction_count ?? 0}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <span className="text-sm text-muted-foreground">
            Total Amount
          </span>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.total_amount ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(
              summary?.completed_amount ?? 0,
              summary?.currency,
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {summary?.completed_count ?? 0} transactions
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Pending
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(
              summary?.pending_amount ?? 0,
              summary?.currency,
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {summary?.pending_count ?? 0} transactions
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4" />
            Failed / Refunded
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(
              (summary?.failed_amount ?? 0) +
                (summary?.refunded_amount ?? 0),
              summary?.currency,
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {(summary?.failed_count ?? 0) +
              (summary?.refunded_count ?? 0)}{" "}
            transactions
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">Transaction Ledger</h2>
            <p className="text-sm text-muted-foreground">
              {data?.total ?? 0} transaction
              {(data?.total ?? 0) === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Studio</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {data?.items?.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-4">
                    <div className="max-w-[300px] truncate font-medium">
                      {item.transaction_id || "—"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.id.slice(0, 8)}...
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium">
                      #{item.payment_number ?? "—"}
                    </div>
                    <div className="text-xs capitalize text-muted-foreground">
                      {item.payment_type.replaceAll("_", " ")}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {item.studio_name}
                  </td>

                  <td className="px-4 py-4 uppercase">
                    {item.payment_method || "—"}
                  </td>

                  <td className="px-4 py-4">
                    {item.gateway_name || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    {money(item.amount, item.currency)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {formatDate(item.transaction_date)}
                  </td>
                </tr>
              ))}

              {!data?.items?.length && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <IndianRupee className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="mt-3 font-medium">
                      No income transactions found
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Try changing the date range or search filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ? offset + 1 : 0} –{" "}
            {Math.min(
              offset + (data?.items?.length ?? 0),
              data?.total ?? 0,
            )}{" "}
            of {data?.total ?? 0}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={offset + limit >= (data?.total ?? 0)}
              onClick={() => setOffset(offset + limit)}
              className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
