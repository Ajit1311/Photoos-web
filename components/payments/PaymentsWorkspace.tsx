"use client";


import type { PaymentRefundSummary } from "@/types/payment";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Filter,
  IndianRupee,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  createPayment,
  updatePayment,
  createPaymentRefund,
  getPaymentRefundSummary,
  getPaymentRefunds,
  getPaymentDashboardDataForWorkspace,
  getPayments,
} from "@/lib/api/payments";

import {
  useClients,
} from "@/hooks/useClients";

import type {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  PaymentTransaction,
  PaymentRefund,
} from "@/types/payment";

type PaymentFilter =
  | "all"
  | "completed"
  | "pending"
  | "failed"
  | "refunded";

type RefundFormState = {
  amount: string;
  reason: string;
  notes: string;
  refundMethod: PaymentMethod;
  gateway: PaymentGateway;
};

const initialRefundForm: RefundFormState = {
  amount: "",
  reason: "",
  notes: "",
  refundMethod: "upi",
  gateway: "manual",
};

function formatCurrency(
  amount: number,
  currency = "INR",
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(
    amount,
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    date,
  );
}

function getStatusClass(
  status: string,
): string {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "success"
  ) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }

  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled"
  ) {
    return "bg-red-500/10 text-red-600 dark:text-red-400";
  }

  if (
    normalized === "refunded"
  ) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }

  return "bg-muted text-muted-foreground";
}

function getMethodLabel(
  method: string,
): string {
  const labels: Record<
    string,
    string
  > = {
    cash: "Cash",
    upi: "UPI",
    net_banking: "Net Banking",
    debit_card: "Debit Card",
    credit_card: "Credit Card",
    phonepe: "PhonePe",
    google_pay: "Google Pay",
    paytm: "Paytm",
    bank_transfer: "Bank Transfer",
    other: "Other",
  };

  return (
    labels[method] ??
    method
      .replaceAll(
        "_",
        " ",
      )
      .replace(
        /\b\w/g,
        (
          character,
        ) =>
          character.toUpperCase(),
      )
  );
}

export function PaymentsWorkspace() {

  const {
    data: clientsData,
    loading: clientsLoading,
  } = useClients({
    allPages: true,
  });


  const [
    payments,
    setPayments,
  ] = useState<
    PaymentTransaction[]
  >([]);

  const [
    refunds,
    setRefunds,
  ] = useState<
    PaymentRefund[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    search,
    setSearch,
  ] = useState(
    "",
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    PaymentFilter
  >("all");

  const [
    clientFilter,
    setClientFilter,
  ] = useState(
    "all",
  );

  const [
    fromDate,
    setFromDate,
  ] = useState(
    "",
  );

  const [
    toDate,
    setToDate,
  ] = useState(
    "",
  );

  const [
    createPaymentModalOpen,
    setCreatePaymentModalOpen,
  ] = useState(false);

  const [
    creatingPayment,
    setCreatingPayment,
  ] = useState(false);

  const [
    createPaymentError,
    setCreatePaymentError,
  ] = useState<string | null>(null);

  const [
    paymentForm,
    setPaymentForm,
  ] = useState({
    clientId: "",
    paymentDate: new Date()
      .toISOString()
      .slice(0, 10),
    amount: "",
    method: "upi" as PaymentMethod,
    transactionId: "",
  });

  const [
    refundModalOpen,
    setRefundModalOpen,
  ] = useState(
    false,
  );

  const [
    refundSummary,
    setRefundSummary,
  ] = useState<PaymentRefundSummary | null>(
    null,
  );

  const [
    selectedPayment,
    setSelectedPayment,
  ] = useState<
    PaymentTransaction | null
  >(null);

  const [
    paymentDetailsOpen,
    setPaymentDetailsOpen,
  ] = useState(false);

  const [
    editPaymentOpen,
    setEditPaymentOpen,
  ] = useState(false);

  const [
    editingPayment,
    setEditingPayment,
  ] = useState(false);

  const [
    editPaymentError,
    setEditPaymentError,
  ] = useState<string | null>(null);

  const [
    editPaymentForm,
    setEditPaymentForm,
  ] = useState({
    paymentId: "",
    clientId: "",
    paymentDate: "",
    amount: "",
    method: "upi" as PaymentMethod,
    transactionId: "",
    status: "completed",
  });

  const [
    refundForm,
    setRefundForm,
  ] = useState<
    RefundFormState
  >(initialRefundForm);

  const [
    refundSubmitting,
    setRefundSubmitting,
  ] = useState(
    false,
  );

  const [
    refundError,
    setRefundError,
  ] = useState<
    string | null
  >(null);

  const loadData =
    useCallback(
      async (
        showRefreshing = false,
      ) => {
        try {
          setError(
            null,
          );

          if (
            showRefreshing
          ) {
            setRefreshing(
              true,
            );
          } else {
            setLoading(
              true,
            );
          }

          const dashboardData =
            await getPaymentDashboardDataForWorkspace();

          setPayments(
            dashboardData.payments,
          );

          setRefunds(
            dashboardData.refunds,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load payment data.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadData();
    },
    [
      loadData,
    ],
  );


  useEffect(
    () => {

      let active =
        true;


      return () => {

        active =
          false;

      };

    },
    [],
  );

  const selectedPaymentClient =
    useMemo(
      () =>
        clientsData?.clients?.find(
          (client) =>
            client.id ===
            paymentForm.clientId,
        ) ?? null,
      [
        clientsData?.clients,
        paymentForm.clientId,
      ],
    );

  const filteredPayments =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return payments.filter(
          (
            payment,
          ) => {

            const matchesStatus =
              statusFilter ===
                "all" ||
              payment.status
                .toLowerCase() ===
                statusFilter;

            if (
              !matchesStatus
            ) {
              return false;
            }


            const matchesClient =
              clientFilter ===
                "all" ||
              payment.clientId ===
                clientFilter;

            if (
              !matchesClient
            ) {
              return false;
            }


            const paymentDate =
              payment.paymentDate ??
              payment.createdAt;

            const normalizedPaymentDate =
              paymentDate
                ? paymentDate.slice(
                    0,
                    10,
                  )
                : "";


            if (
              fromDate &&
              (
                !normalizedPaymentDate ||
                normalizedPaymentDate <
                  fromDate
              )
            ) {
              return false;
            }


            if (
              toDate &&
              (
                !normalizedPaymentDate ||
                normalizedPaymentDate >
                  toDate
              )
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            const searchable =
              [
                payment.paymentNumber.toString(),
                payment.clientName ??
                  "",
                payment.status,
                payment.method,
                payment.clientName ??
                  "",
                payment.transactionId ??
                  "",
                payment.notes ??
                  "",
              ]
                .join(
                  " ",
                )
                .toLowerCase();


            return searchable.includes(
              query,
            );

          },
        );

      },
      [
        payments,
        search,
        statusFilter,
        clientFilter,
        fromDate,
        toDate,
      ],
    );


  const totalCollected =
    useMemo(
      () =>
        filteredPayments
          .filter(
            (
              payment,
            ) =>
              payment.paymentMode ===
                "incoming" &&
              [
                "completed",
                "success",
              ].includes(
                payment.status.toLowerCase(),
              ),
          )
          .reduce(
            (
              total,
              payment,
            ) =>
              total +
              payment.totalAmount,
            0,
          ),
      [
        filteredPayments,
      ],
    );

  const totalRefunded =
    useMemo(
      () =>
        refunds
          .filter(
            (
              refund,
            ) =>
              [
                "completed",
                "processing",
                "pending",
              ].includes(
                refund.status.toLowerCase(),
              ),
          )
          .reduce(
            (
              total,
              refund,
            ) =>
              total +
              refund.amount,
            0,
          ),
      [
        refunds,
      ],
    );

  const pendingAmount =
    useMemo(
      () =>
        filteredPayments
          .filter(
            (
              payment,
            ) =>
              payment.status
                .toLowerCase() ===
              "pending",
          )
          .reduce(
            (
              total,
              payment,
            ) =>
              total +
              payment.totalAmount,
            0,
          ),
      [
        filteredPayments,
      ],
    );

  function openEditPayment(
    payment: PaymentTransaction,
  ) {
    setEditPaymentError(null);

    setEditPaymentForm({
      paymentId: payment.id,
      clientId: payment.clientId ?? "",
      paymentDate: payment.paymentDate
        ? payment.paymentDate.slice(0, 10)
        : "",
      amount: String(payment.totalAmount),
      method: payment.method,
      transactionId: payment.transactionId ?? "",
      status: payment.status,
    });

    setPaymentDetailsOpen(false);
    setEditPaymentOpen(true);
  }


  async function handleEditPayment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setEditPaymentError(null);

    const amount =
      Number(editPaymentForm.amount);

    if (!editPaymentForm.clientId) {
      setEditPaymentError(
        "Please select a client.",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setEditPaymentError(
        "Payment amount must be greater than zero.",
      );
      return;
    }

    if (!editPaymentForm.paymentId) {
      setEditPaymentError(
        "Payment could not be identified.",
      );
      return;
    }

    try {
      setEditingPayment(true);

      await updatePayment({
        paymentId:
          editPaymentForm.paymentId,

        referenceType:
          "client",

        referenceId:
          editPaymentForm.clientId,

        paymentType:
          "full_payment",

        paymentMode:
          "incoming",

        status:
          editPaymentForm.status as PaymentStatus,

        method:
          editPaymentForm.method,

        amount,

        taxAmount:
          0,

        totalAmount:
          amount,

        currency:
          "INR",

        transactionId:
          editPaymentForm.transactionId.trim() ||
          null,

        paymentDate:
          editPaymentForm.paymentDate
            ? `${editPaymentForm.paymentDate}T00:00:00`
            : null,

        dueDate:
          null,

        notes:
          null,

        metadata:
          {},

        customFields:
          {},
      });

      setEditPaymentOpen(false);

      setEditPaymentForm({
        paymentId: "",
        clientId: "",
        paymentDate: "",
        amount: "",
        method: "upi",
        transactionId: "",
        status: "completed",
      });

      await loadData(true);

    } catch (error) {
      setEditPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to update payment.",
      );

    } finally {
      setEditingPayment(false);
    }
  }


  async function handleCreatePayment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreatePaymentError(null);

    const amount =
      Number(paymentForm.amount);

    if (!paymentForm.clientId) {
      setCreatePaymentError(
        "Please select a client.",
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setCreatePaymentError(
        "Payment amount must be greater than zero.",
      );
      return;
    }

    try {
      setCreatingPayment(true);

      await createPayment({
        clientId:
          paymentForm.clientId,

        projectId: null,
        invoiceId: null,

        referenceType: "client",
        referenceId:
          paymentForm.clientId,

        paymentType:
          "full_payment",

        paymentMode:
          "incoming",

         method:
          paymentForm.method,

        amount,

        taxAmount: 0,

        totalAmount:
          amount,

        currency:
          "INR",

        transactionId:
          paymentForm.transactionId
            .trim() || null,

        paymentDate:
          paymentForm.paymentDate
            ? `${paymentForm.paymentDate}T00:00:00`
            : null,

        dueDate: null,

        notes: null,

        metadata: {},

        customFields: {},
      });

      setCreatePaymentModalOpen(
        false,
      );

      setPaymentForm({
        clientId: "",
        paymentDate:
          new Date()
            .toISOString()
            .slice(0, 10),
        amount: "",
        method: "upi",
        transactionId: "",
      });

      await loadData(true);

    } catch (error) {
      setCreatePaymentError(
        error instanceof Error
          ? error.message
          : "Unable to create payment.",
      );

    } finally {
      setCreatingPayment(false);
    }
  }

  const openRefundModal =
    (
      payment: PaymentTransaction,
    ) => {
      setSelectedPayment(
        payment,
      );

      setRefundForm({
        ...initialRefundForm,
        amount:
          payment.totalAmount.toString(),
      });

      setRefundError(
        null,
      );

      setRefundModalOpen(
        true,
      );
    };

  const closeRefundModal =
    () => {
      if (
        refundSubmitting
      ) {
        return;
      }

      setRefundModalOpen(
        false,
      );

      setSelectedPayment(
        null,
      );

      setRefundSummary(
        null,
      );

      setRefundForm(
        initialRefundForm,
      );

      setRefundError(
        null,
      );
    };

  const loadRefundSummary =
    useCallback(
      async (
        paymentId: string,
      ) => {
        const summary =
          await getPaymentRefundSummary(
            paymentId,
          );

        setRefundSummary(
          summary,
        );

        return summary;
      },
      [],
    );

  const handleRefundSubmit =
    async (
      event: React.FormEvent<
        HTMLFormElement
      >,
    ) => {
      event.preventDefault();

      if (
        !selectedPayment
      ) {
        return;
      }

      try {
        setRefundSubmitting(
          true,
        );

        setRefundError(
          null,
        );

        const refundAmount =
          Number(
            refundForm.amount,
          );

        if (
          !Number.isFinite(
            refundAmount,
          ) ||
          refundAmount <= 0
        ) {
          throw new Error(
            "Enter a valid refund amount.",
          );
        }

        const currentRefundSummary =
          await loadRefundSummary(
            selectedPayment.id,
          );

        if (
          !currentRefundSummary.can_refund
        ) {
          throw new Error(
            "This payment cannot be refunded.",
          );
        }

        if (
          refundAmount >
          currentRefundSummary.remaining_refundable_amount
        ) {
          throw new Error(
            "Refund amount cannot be greater than the remaining refundable amount.",
          );
        }

        const createdRefund =
          await createPaymentRefund({
            paymentId:
              selectedPayment.id,
            amount:
              refundAmount,
            reason:
              refundForm.reason,
            notes:
              refundForm.notes,
            refundMethod:
              refundForm.refundMethod,
            gateway:
              refundForm.gateway,
          });

          await loadRefundSummary(
            selectedPayment.id,
          );


        setRefunds(
          (
            current,
          ) => [
            createdRefund,
            ...current,
          ],
        );

        closeRefundModal();

        await loadData(
          true,
        );
      } catch (
        submitError
      ) {
        setRefundError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to create refund.",
        );
      } finally {
        setRefundSubmitting(
          false,
        );
      }
    };

  if (
    loading
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payment data...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Payments
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Track transactions, payment activity, and refunds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCreatePaymentError(null);

                setPaymentForm({
                  clientId: "",
                  paymentDate:
                    new Date()
                      .toISOString()
                      .slice(0, 10),
                  amount: "",
                  method: "upi",
                  transactionId: "",
                });

                setCreatePaymentModalOpen(
                  true,
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08344F]"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>

            <button
              type="button"
              onClick={() =>
                void loadData(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  Unable to load payment data
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadData(
                    true,
                  )
                }
                className="shrink-0 rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Collected
              </span>

              <IndianRupee className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatCurrency(
                totalCollected,
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pending
              </span>

              <WalletCards className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatCurrency(
                pendingAmount,
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Refunded
              </span>

              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatCurrency(
                totalRefunded,
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Transactions
              </span>

              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {payments.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="border-b bg-slate-50/70 p-5">
            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61]/10 text-[#0A3F61]">
                    <Filter className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Payment filters
                    </p>

                    <p className="text-xs text-slate-500">
                      Filter this studio&apos;s payment activity
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setClientFilter("all");
                    setFromDate("");
                    setToDate("");
                  }}
                  disabled={
                    !search &&
                    statusFilter === "all" &&
                    clientFilter === "all" &&
                    !fromDate &&
                    !toDate
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </button>

              </div>


              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search payments..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>


                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={clientFilter}
                    onChange={(event) =>
                      setClientFilter(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  >
                    <option value="all">
                      All clients
                    </option>

                    {clientsLoading ? (
                      <option disabled>
                        Loading clients...
                      </option>
                    ) : (
                      clientsData?.clients?.map(
                        (client) => (
                          <option
                            key={client.id}
                            value={client.id}
                          >
                            {client.display_name}
                          </option>
                        ),
                      )
                    )}
                  </select>
                </div>


                <div>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) =>
                      setFromDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                    aria-label="From date"
                  />
                </div>


                <div>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) =>
                      setToDate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                    aria-label="To date"
                  />
                </div>

              </div>


              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold text-slate-500">
                  Status
                </span>

                {[
                  "all",
                  "completed",
                  "pending",
                  "failed",
                  "refunded",
                ].map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          status as PaymentFilter,
                        )
                      }
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition ${
                        statusFilter === status
                          ? "bg-[#0A3F61] text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}

                <span className="ml-auto text-xs font-medium text-slate-400">
                  Showing {filteredPayments.length} of {payments.length}
                </span>
              </div>

            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Transaction
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Client
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Method
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map(
                  (
                    payment,
                  ) => (
                    <tr
                      key={
                        payment.id
                      }
                      className="border-b last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          #
                          {
                            payment.paymentNumber
                          }
                        </div>

                        <div className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                          {
                            payment.transactionId ??
                              payment.notes ??
                              "No transaction reference"
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <UserRound className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {payment.clientName ??
                                "Walk-in / Unassigned"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {payment.clientId
                                ? "Studio client"
                                : "No client linked"}
                            </p>
                          </div>
                        </div>
                      </td>


                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-muted-foreground" />

                          {
                            getMethodLabel(
                              payment.method,
                            )
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {
                          formatCurrency(
                            payment.totalAmount,
                            payment.currency,
                          )
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {
                          formatDate(
                            payment.paymentDate ??
                              payment.createdAt,
                          )
                        }
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                            payment.status,
                          )}`}
                        >
                          {
                            payment.status.replaceAll(
                              "_",
                              " ",
                            )
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setPaymentDetailsOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openRefundModal(
                              payment,
                            )
                          }
                          disabled={
                            payment.status
                              .toLowerCase() ===
                            "refunded"
                          }
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />

                          Refund
                        </button>
                      </td>
                    </tr>
                  ),
                )}

                {filteredPayments.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-muted-foreground"
                    >
                      No payment transactions found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">
                Refund History
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                All refund requests and processed refunds.
              </p>
            </div>

            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Refund
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Reason
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Method
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {refunds.map(
                  (
                    refund,
                  ) => (
                    <tr
                      key={
                        refund.id
                      }
                      className="border-b last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {
                            refund.id.slice(
                              0,
                              8,
                              )
                          }
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          Payment{" "}
                          {
                            refund.paymentId.slice(
                              0,
                              8,
                            )
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[260px] text-sm">
                          {
                            refund.reason
                          }
                        </div>

                        {refund.notes ? (
                          <div className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
                            {
                              refund.notes
                            }
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {
                          refund.paymentMethod
                            ? getMethodLabel(
                                refund.paymentMethod,
                              )
                            : "—"
                        }
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {
                          formatCurrency(
                            refund.amount,
                            refund.currency,
                          )
                        }
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                            refund.status,
                          )}`}
                        >
                          {
                            refund.status.replaceAll(
                              "_",
                              " ",
                            )
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {
                          formatDate(
                            refund.createdAt,
                          )
                        }
                      </td>
                    </tr>
                  ),
                )}

                {refunds.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-sm text-muted-foreground"
                    >
                      No refunds created yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {refundModalOpen &&
      selectedPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-background shadow-xl">
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Refund
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Payment #
                  {
                    selectedPayment.paymentNumber
                  } ·{" "}
                  {
                    formatCurrency(
                      selectedPayment.totalAmount,
                      selectedPayment.currency,
                    )
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRefundModal
                }
                disabled={
                  refundSubmitting
                }
                className="rounded-lg p-2 hover:bg-muted disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                handleRefundSubmit
              }
              className="space-y-5 p-5"
            >
              {refundError ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                  {
                    refundError
                  }
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Refund Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={
                    selectedPayment.totalAmount
                  }
                  step="0.01"
                  value={
                    refundForm.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setRefundForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        amount:
                          event.target.value,
                      }),
                    )
                  }
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Refund Reason
                </label>

                <textarea
                  value={
                    refundForm.reason
                  }
                  onChange={(
                    event,
                  ) =>
                    setRefundForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        reason:
                          event.target.value,
                      }),
                    )
                  }
                  required
                  rows={3}
                  placeholder="Explain why this refund is being issued..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Payment Method
                </label>

                <select
                  value={
                    refundForm.refundMethod
                  }
                  onChange={(
                    event,
                  ) =>
                    setRefundForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        refundMethod:
                          event.target.value as PaymentMethod,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="upi">
                    UPI
                  </option>

                  <option value="phonepe">
                    PhonePe
                  </option>

                  <option value="google_pay">
                    Google Pay
                  </option>

                  <option value="paytm">
                    Paytm
                  </option>

                  <option value="net_banking">
                    Net Banking
                  </option>

                  <option value="debit_card">
                    Debit Card
                  </option>

                  <option value="credit_card">
                    Credit Card
                  </option>

                  <option value="bank_transfer">
                    Bank Transfer
                  </option>

                  <option value="cash">
                    Cash
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Gateway
                </label>

                <select
                  value={
                    refundForm.gateway
                  }
                  onChange={(
                    event,
                  ) =>
                    setRefundForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        gateway: event.target.value as PaymentGateway,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="manual">
                    Manual Processing
                  </option>

                  <option value="phonepe">
                    PhonePe
                  </option>

                  <option value="razorpay">
                    Razorpay
                  </option>

                  <option value="cashfree">
                    Cashfree
                  </option>

                  <option value="paytm">
                    Paytm
                  </option>
                </select>

                <p className="text-xs text-muted-foreground">
                  Gateway integration can be activated later.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Notes
                </label>

                <textarea
                  value={
                    refundForm.notes
                  }
                  onChange={(
                    event,
                  ) =>
                    setRefundForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        notes:
                          event.target.value,
                      }),
                    )
                  }
                  rows={3}
                  placeholder="Optional internal notes..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={
                    closeRefundModal
                  }
                  disabled={
                    refundSubmitting
                  }
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    refundSubmitting
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refundSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  {
                    refundSubmitting
                      ? "Creating Refund..."
                      : "Create Refund"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {createPaymentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Transaction
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record a manual payment transaction
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!creatingPayment) {
                    setCreatePaymentModalOpen(false);
                    setCreatePaymentError(null);
                  }
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePayment}
              className="space-y-5 p-6"
            >

              {createPaymentError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {createPaymentError}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Client
                </label>

                <select
                  required
                  value={paymentForm.clientId}
                  onChange={(event) => {
                    setPaymentForm((current) => ({
                      ...current,
                      clientId: event.target.value,
                    }));
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                >
                  <option value="">
                    Select client
                  </option>

                  {clientsData?.clients?.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {paymentForm.clientId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  {(() => {
                    const selectedClient =
                      clientsData?.clients?.find(
                        (client) =>
                          client.id === paymentForm.clientId,
                      );

                    if (!selectedClient) {
                      return null;
                    }

                    return (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Client name
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedClient.display_name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedClient.phone || "Not available"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Payment date
                  </label>

                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={(event) => {
                      setPaymentForm((current) => ({
                        ...current,
                        paymentDate: event.target.value,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={paymentForm.amount}
                    onChange={(event) => {
                      setPaymentForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }));
                    }}
                    placeholder="₹ 0.00"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Way of payment
                  </label>

                  <select
                    value={paymentForm.method}
                    onChange={(event) => {
                      setPaymentForm((current) => ({
                        ...current,
                        method:
                          event.target.value as PaymentMethod,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">
                      Net Banking
                    </option>
                    <option value="debit_card">
                      Debit Card
                    </option>
                    <option value="credit_card">
                      Credit Card
                    </option>
                    <option value="phonepe">PhonePe</option>
                    <option value="paytm">Paytm</option>
                    <option value="bank_transfer">
                      Bank Transfer
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Transaction ID
                  </label>

                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(event) => {
                      setPaymentForm((current) => ({
                        ...current,
                        transactionId: event.target.value,
                      }));
                    }}
                    placeholder="Optional"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  disabled={creatingPayment}
                  onClick={() => {
                    setCreatePaymentModalOpen(false);
                    setCreatePaymentError(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingPayment}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08344F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save Transaction
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      ) : null}



      {paymentDetailsOpen && selectedPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Transaction #{selectedPayment.paymentNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPaymentDetailsOpen(false);
                  setSelectedPayment(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close payment details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Client
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPayment.clientId
                      ? (
                          clientsData?.clients?.find(
                            (client) =>
                              client.id === selectedPayment.clientId,
                          )?.display_name ??
                          "Unknown client"
                        )
                      : "No client"}
                  </p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(
                      selectedPayment.totalAmount,
                      selectedPayment.currency,
                    )}
                  </p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Payment method
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPayment.method
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (character) =>
                        character.toUpperCase(),
                      )}
                  </p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                    {selectedPayment.status}
                  </p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Payment date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPayment.paymentDate
                      ? new Date(
                          selectedPayment.paymentDate,
                        ).toLocaleDateString("en-IN")
                      : "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Transaction ID
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {selectedPayment.transactionId ||
                      "Not provided"}
                  </p>
                </div>

              </div>

              {selectedPayment.notes ? (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedPayment.notes}
                  </p>
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => {
                    openEditPayment(selectedPayment);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#08344F]"
                >
                  Edit Transaction
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentDetailsOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : null}



      {editPaymentOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Transaction
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update payment transaction details
                </p>
              </div>

              <button
                type="button"
                disabled={editingPayment}
                onClick={() => {
                  setEditPaymentOpen(false);
                  setEditPaymentError(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                aria-label="Close edit transaction"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditPayment}
              className="space-y-5 p-6"
            >

              {editPaymentError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editPaymentError}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Client
                </label>

                <select
                  required
                  value={editPaymentForm.clientId}
                  onChange={(event) => {
                    setEditPaymentForm((current) => ({
                      ...current,
                      clientId: event.target.value,
                    }));
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                >
                  <option value="">
                    Select client
                  </option>

                  {clientsData?.clients?.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {editPaymentForm.clientId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  {(() => {
                    const selectedClient =
                      clientsData?.clients?.find(
                        (client) =>
                          client.id ===
                          editPaymentForm.clientId,
                      );

                    if (!selectedClient) {
                      return null;
                    }

                    return (
                      <div className="grid gap-3 sm:grid-cols-2">

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Client name
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedClient.display_name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedClient.phone ||
                              "Not available"}
                          </p>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Payment date
                  </label>

                  <input
                    type="date"
                    required
                    value={editPaymentForm.paymentDate}
                    onChange={(event) => {
                      setEditPaymentForm((current) => ({
                        ...current,
                        paymentDate:
                          event.target.value,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={editPaymentForm.amount}
                    onChange={(event) => {
                      setEditPaymentForm((current) => ({
                        ...current,
                        amount:
                          event.target.value,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Way of payment
                  </label>

                  <select
                    value={editPaymentForm.method}
                    onChange={(event) => {
                      setEditPaymentForm((current) => ({
                        ...current,
                        method:
                          event.target.value as PaymentMethod,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">
                      Net Banking
                    </option>
                    <option value="debit_card">
                      Debit Card
                    </option>
                    <option value="credit_card">
                      Credit Card
                    </option>
                    <option value="phonepe">
                      PhonePe
                    </option>
                    <option value="paytm">
                      Paytm
                    </option>
                    <option value="bank_transfer">
                      Bank Transfer
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Status
                  </label>

                  <select
                    value={editPaymentForm.status}
                    onChange={(event) => {
                      setEditPaymentForm((current) => ({
                        ...current,
                        status:
                          event.target.value,
                      }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  >
                    <option value="completed">
                      Completed
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="failed">
                      Failed
                    </option>
                  </select>
                </div>

              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Transaction ID
                </label>

                <input
                  type="text"
                  value={editPaymentForm.transactionId}
                  onChange={(event) => {
                    setEditPaymentForm((current) => ({
                      ...current,
                      transactionId:
                        event.target.value,
                    }));
                  }}
                  placeholder="Optional"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  disabled={editingPayment}
                  onClick={() => {
                    setEditPaymentOpen(false);
                    setEditPaymentError(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editingPayment}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#08344F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      ) : null}


    </>
  );
}