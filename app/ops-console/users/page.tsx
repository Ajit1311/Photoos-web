"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getPlatformAdminUserFinancialHistory,
  getPlatformAdminUsers,
  type PlatformAdminUser,
  type PlatformAdminUserFinancialHistory,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 25;

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatMoney(
  value: number | null,
  currency: string | null,
) {
  if (value == null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClass(status: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "trial":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "cancelled":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "expired":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

function initials(user: PlatformAdminUser) {
  const source =
    user.full_name ||
    user.studio_name ||
    user.studio_email ||
    "U";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformAdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState("all");
  const [page, setPage] = useState(0);

  const [selectedUser, setSelectedUser] =
    useState<PlatformAdminUser | null>(null);
  const [financialHistory, setFinancialHistory] =
    useState<PlatformAdminUserFinancialHistory | null>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialError, setFinancialError] = useState<string | null>(null);

  async function openUserDetails(user: PlatformAdminUser) {
    setSelectedUser(user);
    setFinancialHistory(null);
    setFinancialError(null);
    setFinancialLoading(true);

    try {
      const result = await getPlatformAdminUserFinancialHistory(
        user.profile_id,
      );
      setFinancialHistory(result);
    } catch (err) {
      setFinancialError(
        err instanceof Error
          ? err.message
          : "Unable to load financial history.",
      );
    } finally {
      setFinancialLoading(false);
    }
  }

  function closeUserDetails() {
    setSelectedUser(null);
    setFinancialHistory(null);
    setFinancialError(null);
  }

  async function loadUsers(showRefresh = false) {
    try {
      setError(null);

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getPlatformAdminUsers({
        search,
        status,
        subscriptionStatus,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });

      setUsers(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load platform users.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [page, status, subscriptionStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      void loadUsers();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min((page + 1) * PAGE_SIZE, total);

  const stats = useMemo(() => {
    const active = users.filter(
      (user) => user.profile_status === "active",
    ).length;

    const subscribed = users.filter(
      (user) => user.subscription_status === "active",
    ).length;

    const trials = users.filter(
      (user) =>
        user.subscription_status === "trial" ||
        user.trial_end_at != null,
    ).length;

    return {
      active,
      subscribed,
      trials,
    };
  }, [users]);

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <UsersRound className="h-4 w-4" />
              Platform
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              All Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage PhotoOS customers, studios, subscriptions and account activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadUsers(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={UsersRound}
            label="Total Users"
            value={total}
          />
          <StatCard
            icon={UserRound}
            label="Active on Page"
            value={stats.active}
          />
          <StatCard
            icon={CreditCard}
            label="Active Subscriptions"
            value={stats.subscribed}
          />
          <StatCard
            icon={CircleDollarSign}
            label="Trials"
            value={stats.trials}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users, studios or email..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All User Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={subscriptionStatus}
              onChange={(event) => {
                setSubscriptionStatus(event.target.value);
                setPage(0);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Subscription</th>
                  <th className="px-5 py-3">Next Billing</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.profile_id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {initials(user)}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">
                              {user.full_name || "Unnamed User"}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5" />
                              {user.studio_email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-800">
                              {user.studio_name || "—"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.studio_code || "No studio code"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {user.role_name || "—"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.membership_status || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {user.plan_name || "No Plan"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatMoney(user.plan_price, user.plan_currency)}
                          {user.billing_cycle
                            ? ` / ${user.billing_cycle}`
                            : ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                            user.subscription_status,
                          )}`}
                        >
                          {user.subscription_status || "none"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.next_billing_at)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.user_created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void openUserDetails(user)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {showingFrom}–{showingTo} of {total} users
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-xs font-semibold text-slate-500">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() =>
                  setPage((value) =>
                    Math.min(totalPages - 1, value + 1),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  User Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedUser.full_name || "Unnamed User"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeUserDetails}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <DetailSection title="Profile">
                <DetailRow label="Profile ID" value={selectedUser.profile_id} />
                <DetailRow label="Email" value={selectedUser.studio_email} />
                <DetailRow label="Phone" value={selectedUser.studio_phone} />
                <DetailRow label="Status" value={selectedUser.profile_status} />
                <DetailRow
                  label="Created"
                  value={formatDate(selectedUser.user_created_at)}
                />
                <DetailRow
                  label="Last Seen"
                  value={formatDate(selectedUser.last_seen_at)}
                />
              </DetailSection>

              <DetailSection title="Studio">
                <DetailRow label="Studio" value={selectedUser.studio_name} />
                <DetailRow label="Code" value={selectedUser.studio_code} />
                <DetailRow label="Legal Name" value={selectedUser.legal_name} />
                <DetailRow label="Brand" value={selectedUser.brand_name} />
                <DetailRow label="Role" value={selectedUser.role_name} />
                <DetailRow
                  label="Location"
                  value={[
                    selectedUser.city,
                    selectedUser.state,
                    selectedUser.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || null}
                />
              </DetailSection>

              <DetailSection title="Current Subscription">
                <DetailRow label="Plan" value={selectedUser.plan_name} />
                <DetailRow
                  label="Price"
                  value={formatMoney(
                    selectedUser.plan_price,
                    selectedUser.plan_currency,
                  )}
                />
                <DetailRow
                  label="Billing"
                  value={selectedUser.billing_cycle}
                />
                <DetailRow
                  label="Status"
                  value={selectedUser.subscription_status}
                />
                <DetailRow
                  label="Start"
                  value={formatDate(selectedUser.subscription_start_at)}
                />
                <DetailRow
                  label="End"
                  value={formatDate(selectedUser.subscription_end_at)}
                />
                <DetailRow
                  label="Next Billing"
                  value={formatDate(selectedUser.next_billing_at)}
                />
                <DetailRow
                  label="Auto Renew"
                  value={
                    selectedUser.auto_renew == null
                      ? null
                      : selectedUser.auto_renew
                        ? "Enabled"
                        : "Disabled"
                  }
                />
                <DetailRow
                  label="Trial Start"
                  value={formatDate(selectedUser.trial_start_at)}
                />
                <DetailRow
                  label="Trial End"
                  value={formatDate(selectedUser.trial_end_at)}
                />
              </DetailSection>

              {financialLoading && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-16 animate-pulse rounded bg-slate-100" />
                </div>
              )}

              {financialError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {financialError}
                </div>
              )}

              {financialHistory && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Total Paid
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-950">
                        {formatMoney(
                          financialHistory.summary.total_paid,
                          selectedUser.plan_currency || "INR",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Payments
                      </p>
                      <p className="mt-2 text-xl font-bold text-slate-950">
                        {financialHistory.summary.payment_count}
                      </p>
                    </div>
                  </div>

                  <DetailSection title="Subscription History">
                    {financialHistory.subscription_history.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-slate-500">
                        No subscription history.
                      </div>
                    ) : (
                      financialHistory.subscription_history.map(
                        (subscription) => (
                          <div
                            key={subscription.subscription_id}
                            className="space-y-3 px-4 py-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {subscription.plan_name || "Unknown Plan"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {subscription.billing_cycle || "—"}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                  subscription.status,
                                )}`}
                              >
                                {subscription.status || "unknown"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400">
                                  Start
                                </span>
                                <p className="mt-1 font-medium text-slate-700">
                                  {formatDate(
                                    subscription.subscription_start_at,
                                  )}
                                </p>
                              </div>

                              <div>
                                <span className="text-slate-400">
                                  End
                                </span>
                                <p className="mt-1 font-medium text-slate-700">
                                  {formatDate(
                                    subscription.subscription_end_at,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </DetailSection>

                  <DetailSection title="Payment History">
                    {financialHistory.payment_history.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-slate-500">
                        No payment history.
                      </div>
                    ) : (
                      financialHistory.payment_history.map((payment) => (
                        <div
                          key={payment.subscription_payment_id}
                          className="space-y-3 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {formatMoney(
                                  payment.total_amount ?? payment.amount,
                                  payment.currency || "INR",
                                )}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {payment.method?.toUpperCase() || "—"} ·{" "}
                                {formatDate(payment.payment_date)}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                payment.payment_status,
                              )}`}
                            >
                              {payment.payment_status || "unknown"}
                            </span>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 text-xs">
                            <p className="font-medium text-slate-700">
                              Transaction
                            </p>
                            <p className="mt-1 break-all text-slate-500">
                              {payment.transaction_id || "—"}
                            </p>

                            {payment.gateway_transactions.map(
                              (transaction) => (
                                <div
                                  key={`${payment.subscription_payment_id}-${transaction.transaction_id}`}
                                  className="mt-3 border-t border-slate-200 pt-3"
                                >
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-400">
                                      Gateway
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      {transaction.gateway_name || "—"}
                                    </span>
                                  </div>

                                  <div className="mt-1 flex justify-between gap-3">
                                    <span className="text-slate-400">
                                      Amount
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      {formatMoney(
                                        transaction.amount,
                                        payment.currency || "INR",
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </DetailSection>
                </>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Account activity
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Last active: {formatDate(selectedUser.last_active_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Platform
        </span>
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-900">{title}</h3>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="max-w-[65%] break-words text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}
