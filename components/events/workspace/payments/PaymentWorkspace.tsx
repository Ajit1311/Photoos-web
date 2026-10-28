"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CreditCard,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react";

import {
  getSupabaseClient,
} from "@/lib/supabase/client";

type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "cheque"
  | "wallet"
  | "online_gateway"
  | "other";

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partial"
  | "paid";

interface EventPayment {
  id: string;

  event_id?: string | null;

  payment_id?: string | null;

  payment_number?: number | string | null;

  amount: number | string | null;

  total_amount?: number | string | null;

  currency?: string | null;

  status: string | null;

  method: string | null;

  transaction_id?: string | null;

  gateway_name?: string | null;

  payment_date?: string | null;

  transaction_date?: string | null;

  notes?: string | null;

  remarks?: string | null;

  created_at?: string | null;

  metadata?: Record<
    string,
    unknown
  > | null;
}

interface CreatePaymentForm {
  amount: string;

  method: PaymentMethod;

  transactionId: string;

  gatewayName: string;

  paymentDate: string;

  notes: string;

  status: PaymentStatus;
}

interface StudioInvoiceData {
  id: string;

  name?: string | null;

  legal_name?: string | null;

  brand_name?: string | null;

  contact_phone?: string | null;

  contact_email?: string | null;

  address?: string | null;

  city?: string | null;

  state?: string | null;

  country?: string | null;

  postal_code?: string | null;

  logo_url?: string | null;

  tax_id?: string | null;

  currency?: string | null;
}

interface EventInvoiceData {
  id: string;

  code?: string | null;

  name?: string | null;

  title?: string | null;

  event_name?: string | null;

  event_date?: string | null;

  start_date?: string | null;

  date?: string | null;

  studio_id?: string | null;
}

interface ClientInvoiceData {
  name?: string | null;

  phone?: string | null;
}

interface PaymentWorkspaceProps {
  eventId: string;
}

const initialForm: CreatePaymentForm = {
  amount: "",

  method: "cash",

  transactionId: "",

  gatewayName: "",

  paymentDate:
    new Date()
      .toISOString()
      .slice(0, 16),

  notes: "",

  status: "completed",
};

function formatCurrency(
  value: number,
  currency = "INR",
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",

      currency,

      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatDate(
  value?: string | null,
) {
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
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",

      timeStyle: "short",
    },
  ).format(date);
}

function formatInvoiceDate(
  value?: string | null,
) {
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
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    },
  ).format(date);
}

function getAmount(
  payment: EventPayment,
) {
  const value =
    payment.total_amount ??
    payment.amount ??
    0;

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getPaymentDate(
  payment: EventPayment,
) {
  return (
    payment.transaction_date ??
    payment.payment_date ??
    payment.created_at ??
    null
  );
}

function getStatusClass(
  status?: string | null,
) {
  switch (
    status?.toLowerCase()
  ) {
    case "completed":
    case "paid":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "pending":
    case "processing":
    case "partial":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "failed":
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-600/20";

    case "refunded":
      return "bg-violet-50 text-violet-700 ring-violet-600/20";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-600/10";
  }
}

function getMethodLabel(
  method?: string | null,
) {
  if (!method) {
    return "Unknown";
  }

  return method
    .split("_")
    .map(
      (
        part,
      ) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function requiresTransactionId(
  method: PaymentMethod,
) {
  return method !== "cash";
}

function getMethodIcon(
  method?: string | null,
) {
  switch (method) {
    case "cash":
      return (
        <Banknote className="h-4 w-4" />
      );

    case "upi":
    case "wallet":
    case "online_gateway":
      return (
        <Smartphone className="h-4 w-4" />
      );

    default:
      return (
        <CreditCard className="h-4 w-4" />
      );
  }
}

function getErrorMessage(
  error: unknown,
) {
  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as {
        message?: unknown;
        details?: unknown;
        hint?: unknown;
      };

    if (
      typeof value.message === "string" &&
      value.message.trim()
    ) {
      return value.message;
    }

    if (
      typeof value.details === "string" &&
      value.details.trim()
    ) {
      return value.details;
    }

    if (
      typeof value.hint === "string" &&
      value.hint.trim()
    ) {
      return value.hint;
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Unable to complete the payment request.";
}

function normalizePayments(
  data: unknown,
): EventPayment[] {
  if (
    Array.isArray(data)
  ) {
    return data as EventPayment[];
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const value =
      data as {
        payments?: unknown;
        data?: unknown;
        transactions?: unknown;
      };

    if (
      Array.isArray(
        value.payments,
      )
    ) {
      return value.payments as EventPayment[];
    }

    if (
      Array.isArray(
        value.transactions,
      )
    ) {
      return value.transactions as EventPayment[];
    }

    if (
      Array.isArray(
        value.data,
      )
    ) {
      return value.data as EventPayment[];
    }
  }

  return [];
}

function buildStudioAddress(
  studio: StudioInvoiceData | null,
) {
  if (!studio) {
    return "";
  }

  return [
    studio.address,
    studio.city,
    studio.state,
    studio.country,
    studio.postal_code,
  ]
    .filter(
      Boolean,
    )
    .join(", ");
}

function getEventDisplayName(
  event: EventInvoiceData | null,
) {
  if (!event) {
    return "Event";
  }

  return (
    event.event_name ||
    event.name ||
    event.title ||
    event.code ||
    "Event"
  );
}

function getEventDate(
  event: EventInvoiceData | null,
) {
  if (!event) {
    return null;
  }

  return (
    event.event_date ||
    event.start_date ||
    event.date ||
    null
  );
}

function getDateInputValue(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}

export default function PaymentWorkspace({
  eventId,
}: PaymentWorkspaceProps) {
  const [
    supabase,
  ] =
    useState(
      () =>
        getSupabaseClient(),
    );

  const [
    payments,
    setPayments,
  ] =
    useState<EventPayment[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isModalOpen,
    setIsModalOpen,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<CreatePaymentForm>(
      initialForm,
    );

  const [
    studio,
    setStudio,
  ] =
    useState<StudioInvoiceData | null>(
      null,
    );

  const [
    eventData,
    setEventData,
  ] =
    useState<EventInvoiceData | null>(
      null,
    );

  const [
    invoiceLoading,
    setInvoiceLoading,
  ] =
    useState(false);

  const [
    invoiceFromDate,
    setInvoiceFromDate,
  ] =
    useState("");

  const [
    invoiceToDate,
    setInvoiceToDate,
  ] =
    useState("");

  const loadPayments =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        if (!eventId) {
          setPayments([]);
          setLoading(false);
          setRefreshing(false);

          return;
        }

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          let accessToken: string | null = null;
          try {
            const { getAccessToken } = await import("@/lib/auth/session");
            accessToken = await getAccessToken();
          } catch {
            // continue
          }

          if (!accessToken) {
            try {
              const { getFirebaseIdToken } = await import(
                "@/lib/auth/firebase-auth.service"
              );
              accessToken = await getFirebaseIdToken();
            } catch {
              // continue
            }
          }

          if (accessToken) {
            const {
              data,
              error: functionError,
            } =
              await supabase.functions.invoke(
                "firebase-event-payments",
                {
                  method: "POST",
                  headers: {
                    Authorization:
                      `Bearer ${accessToken}`,
                  },
                  body: {
                    event_id:
                      eventId,
                  },
                },
              );

            if (!functionError && data) {
              const normalized =
                normalizePayments(
                  data,
                );
              setPayments(
                normalized,
              );
              return;
            }
          }

          // Resilient default: newly created events have 0 payments
          setPayments([]);
        } catch (
          loadError
        ) {
          console.warn("[PaymentWorkspace] Notice, using default empty payments:", loadError);
          setPayments([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        eventId,
        supabase,
      ],
    );

  const loadInvoiceData =
    useCallback(
      async (): Promise<{
        event: EventInvoiceData;
        studio: StudioInvoiceData;
        client: ClientInvoiceData;
      }> => {
        const firstPayment =
          payments[0];

        const metadata =
          firstPayment?.metadata &&
          typeof firstPayment.metadata === "object"
            ? firstPayment.metadata
            : {};

        const getMetadataString =
          (
            ...keys: string[]
          ): string | null => {
            for (
              const key of keys
            ) {
              const value =
                metadata[key];

              if (
                typeof value === "string" &&
                value.trim()
              ) {
                return value.trim();
              }
            }

            return null;
          };

        const resolvedEvent: EventInvoiceData = {
          id: eventId,
          code:
            getMetadataString(
              "event_code",
              "code",
            ) ||
            eventId
              .slice(0, 8)
              .toUpperCase(),
          name:
            getMetadataString(
              "event_name",
              "event_title",
              "name",
            ) || "Event",
          event_date:
            getMetadataString(
              "event_date",
              "start_date",
            ) ||
            getPaymentDate(
              firstPayment || {
                id: "",
                amount: 0,
                status: null,
                method: null,
              },
            ),
          studio_id:
            getMetadataString(
              "studio_id",
            ),
        };

        const resolvedStudio: StudioInvoiceData = {
          id:
            resolvedEvent.studio_id ||
            "event-studio",
          name:
            getMetadataString(
              "studio_name",
              "studio_legal_name",
            ) || "Photography Studio",
          brand_name:
            getMetadataString(
              "studio_brand_name",
              "brand_name",
            ),
          legal_name:
            getMetadataString(
              "studio_legal_name",
              "legal_name",
            ),
          contact_phone:
            getMetadataString(
              "studio_phone",
              "contact_phone",
            ),
          contact_email:
            getMetadataString(
              "studio_email",
              "contact_email",
            ),
          address:
            getMetadataString(
              "studio_address",
              "address",
            ),
          city:
            getMetadataString(
              "studio_city",
              "city",
            ),
          state:
            getMetadataString(
              "studio_state",
              "state",
            ),
          country:
            getMetadataString(
              "studio_country",
              "country",
            ),
          postal_code:
            getMetadataString(
              "studio_postal_code",
              "postal_code",
            ),
          logo_url:
            getMetadataString(
              "studio_logo_url",
              "logo_url",
            ),
          tax_id:
            getMetadataString(
              "studio_tax_id",
              "tax_id",
            ),
          currency:
            firstPayment?.currency ||
            getMetadataString(
              "currency",
            ) || "INR",
        };

        const resolvedClient: ClientInvoiceData = {
          name:
            getMetadataString(
              "client_name",
              "customer_name",
              "client_full_name",
            ) || "Client",
          phone:
            getMetadataString(
              "client_phone",
              "client_mobile",
              "customer_phone",
              "phone",
            ),
        };

        setEventData(resolvedEvent);
        setStudio(resolvedStudio);

        return {
          event: resolvedEvent,
          studio: resolvedStudio,
          client: resolvedClient,
        };
      },
      [eventId, payments],
    );

  useEffect(
    () => {
      void loadPayments();
    },
    [
      loadPayments,
    ],
  );

  const summary =
    useMemo(
      () => {
        let totalReceived = 0;

        let pending = 0;

        let failed = 0;

        payments.forEach(
          (
            payment,
          ) => {
            const amount =
              getAmount(
                payment,
              );

            const status =
              payment.status?.toLowerCase();

            if (
              status === "completed" ||
              status === "paid"
            ) {
              totalReceived +=
                amount;

              return;
            }

            if (
              status === "failed" ||
              status === "cancelled"
            ) {
              failed +=
                amount;

              return;
            }

            pending +=
              amount;
          },
        );

        return {
          totalReceived,

          pending,

          failed,

          transactionCount:
            payments.length,
        };
      },
      [
        payments,
      ],
    );

  const invoiceNumber =
    useMemo(
      () => {
        const eventCode =
          eventData?.code ||
          eventId
            .slice(0, 8)
            .toUpperCase();

        const date =
          new Date();

        return `INV-${eventCode}-${date
          .toISOString()
          .slice(0, 10)
          .replaceAll(
            "-",
            "",
          )}`;
      },
      [
        eventData?.code,
        eventId,
      ],
    );

  function openPaymentModal() {
    setForm(
      {
        ...initialForm,

        paymentDate:
          new Date()
            .toISOString()
            .slice(0, 16),
      },
    );

    setError(null);

    setIsModalOpen(
      true,
    );
  }

  function closePaymentModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(
      false,
    );
  }

  function updateForm<
    K extends keyof CreatePaymentForm,
  >(
    key: K,
    value: CreatePaymentForm[K],
  ) {
    setForm(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          value,
      }),
    );
  }

  async function handleCreatePayment(
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    if (!eventId) {
      setError(
        "Event ID is missing.",
      );

      return;
    }

    const amount =
      Number(
        form.amount,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      setError(
        "Please enter a valid payment amount.",
      );

      return;
    }

    if (
      requiresTransactionId(
        form.method,
      ) &&
      !form.transactionId.trim()
    ) {
      setError(
        "Transaction ID is required for this payment method.",
      );

      return;
    }

    setSaving(true);

    setError(null);

    try {
      const paymentDate =
        form.paymentDate
          ? new Date(
              form.paymentDate,
            ).toISOString()
          : new Date().toISOString();

      const {
        error: rpcError,
      } =
        await supabase.rpc(
          "create_event_payment",
          {
            p_event_id:
              eventId,

            p_amount:
              amount,

            p_method:
              form.method,

            p_transaction_id:
              form.transactionId.trim() ||
              null,

            p_gateway_name:
              form.gatewayName.trim() ||
              null,

            p_payment_date:
              paymentDate,

            p_notes:
              form.notes.trim() ||
              null,

            p_status:
              form.status,

            p_metadata:
              {},
          },
        );

      if (rpcError) {
        console.error(
          "create_event_payment RPC failed",
          {
            eventId,

            code:
              rpcError.code,

            message:
              rpcError.message,

            details:
              rpcError.details,

            hint:
              rpcError.hint,

            fullError:
              rpcError,
          },
        );

        throw new Error(
          rpcError.message ||
            "Unable to create event payment.",
        );
      }

      setIsModalOpen(
        false,
      );

      setForm(
        initialForm,
      );

      await loadPayments(
        true,
      );
    } catch (
      createError
    ) {
      const message =
        getErrorMessage(
          createError,
        );

      console.error(
        "Failed to create event payment",
        {
          eventId,

          error:
            createError,

          message,
        },
      );

      setError(
        message,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateInvoice() {
    setInvoiceLoading(
      true,
    );

    try {
      const invoiceData =
        await loadInvoiceData();

      const invoiceStudio =
        studio ||
        invoiceData.studio;

      const invoiceEvent =
        eventData ||
        invoiceData.event;

      const invoiceClient =
        invoiceData.client;

      if (
        invoiceFromDate &&
        invoiceToDate &&
        invoiceFromDate > invoiceToDate
      ) {
        throw new Error(
          "From date cannot be later than To date.",
        );
      }

      const invoicePayments =
        payments.filter(
          (
            payment,
          ) => {
            const paymentDate =
              getDateInputValue(
                getPaymentDate(payment),
              );

            if (!paymentDate) {
              return false;
            }

            if (
              invoiceFromDate &&
              paymentDate < invoiceFromDate
            ) {
              return false;
            }

            if (
              invoiceToDate &&
              paymentDate > invoiceToDate
            ) {
              return false;
            }

            return true;
          },
        );

      const invoiceSummary =
        invoicePayments.reduce(
          (
            result,
            payment,
          ) => {
            const amount =
              getAmount(payment);

            const status =
              payment.status?.toLowerCase();

            result.transactionCount += 1;

            if (
              status === "completed" ||
              status === "paid"
            ) {
              result.totalReceived += amount;
            } else if (
              status === "failed" ||
              status === "cancelled"
            ) {
              result.failed += amount;
            } else {
              result.pending += amount;
            }

            return result;
          },
          {
            totalReceived: 0,
            pending: 0,
            failed: 0,
            transactionCount: 0,
          },
        );

      const popup =
        window.open(
          "",
          "_blank",
          "width=1000,height=900",
        );

      if (!popup) {
        throw new Error(
          "Please allow popups to generate the invoice.",
        );
      }

      const studioName =
        invoiceStudio?.brand_name ||
        invoiceStudio?.name ||
        invoiceStudio?.legal_name ||
        "Photography Studio";

      const address =
        buildStudioAddress(
          invoiceStudio,
        );

      const currency =
        invoiceStudio?.currency ||
        "INR";

      const eventName =
        getEventDisplayName(
          invoiceEvent,
        );

      const eventDate =
        getEventDate(
          invoiceEvent,
        );

      const transactionsHtml =
        invoicePayments.length > 0
          ? invoicePayments
              .map(
                (
                  payment,
                  index,
                ) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      ${
                        payment.transaction_id ||
                        payment.payment_number ||
                        "Manual Payment"
                      }
                    </td>
                    <td>
                      ${getMethodLabel(
                        payment.method,
                      )}
                    </td>
                    <td>
                      ${formatInvoiceDate(
                        getPaymentDate(
                          payment,
                        ),
                      )}
                    </td>
                    <td>
                      ${
                        payment.gateway_name ||
                        payment.notes ||
                        payment.remarks ||
                        "—"
                      }
                    </td>
                    <td class="amount">
                      ${formatCurrency(
                        getAmount(
                          payment,
                        ),
                        payment.currency ||
                          currency,
                      )}
                    </td>
                    <td>
                      ${
                        payment.status ||
                        "unknown"
                      }
                    </td>
                  </tr>
                `,
              )
              .join("")
          : `
            <tr>
              <td
                colspan="7"
                class="empty"
              >
                No payment transactions available.
              </td>
            </tr>
          `;

      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${invoiceNumber}</title>

            <meta charset="utf-8" />

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                padding: 40px;
                font-family:
                  Arial,
                  Helvetica,
                  sans-serif;
                color: #0f172a;
                background: #ffffff;
              }

              .invoice {
                max-width: 1000px;
                margin: 0 auto;
              }

              .header {
                display: flex;
                justify-content: space-between;
                gap: 40px;
                padding-bottom: 28px;
                border-bottom:
                  2px solid #0f172a;
              }

              .studio {
                display: flex;
                gap: 16px;
                align-items: flex-start;
              }

              .logo {
                width: 72px;
                height: 72px;
                border-radius: 12px;
                object-fit: contain;
                border:
                  1px solid #e2e8f0;
                padding: 6px;
              }

              .studio-name {
                font-size: 26px;
                font-weight: 700;
                margin: 0;
              }

              .studio-info {
                margin-top: 8px;
                color: #475569;
                font-size: 13px;
                line-height: 1.7;
              }

              .invoice-title {
                text-align: right;
              }

              .invoice-title h1 {
                margin: 0;
                font-size: 34px;
                letter-spacing: 1px;
              }

              .invoice-number {
                margin-top: 10px;
                font-size: 14px;
                font-weight: 600;
              }

              .meta {
                margin-top: 4px;
                font-size: 13px;
                color: #64748b;
              }

              .details {
                display: grid;
                grid-template-columns:
                  1fr 1fr;
                gap: 24px;
                margin-top: 32px;
              }

              .card {
                border:
                  1px solid #e2e8f0;
                border-radius: 12px;
                padding: 18px;
              }

              .label {
                color: #64748b;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
              }

              .value {
                margin-top: 8px;
                font-size: 17px;
                font-weight: 600;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 32px;
              }

              thead {
                background: #0f172a;
                color: #ffffff;
              }

              th {
                padding: 12px;
                text-align: left;
                font-size: 11px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              }

              td {
                padding: 13px 12px;
                border-bottom:
                  1px solid #e2e8f0;
                font-size: 13px;
              }

              .amount {
                text-align: right;
                font-weight: 600;
              }

              .empty {
                text-align: center;
                padding: 40px;
                color: #64748b;
              }

              .summary {
                display: flex;
                justify-content: flex-end;
                margin-top: 28px;
              }

              .summary-box {
                width: 320px;
                border:
                  1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
              }

              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 13px 16px;
                border-bottom:
                  1px solid #e2e8f0;
              }

              .summary-row:last-child {
                border-bottom: 0;
                background: #f8fafc;
                font-size: 17px;
                font-weight: 700;
              }

              .footer {
                margin-top: 48px;
                padding-top: 20px;
                border-top:
                  1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 12px;
              }

              @media print {
                body {
                  padding: 0;
                }

                .invoice {
                  max-width: none;
                }
              }
            </style>
          </head>

          <body>
            <main class="invoice">
              <section class="header">
                <div class="studio">
                  ${
                    invoiceStudio?.logo_url
                      ? `
                        <img
                          class="logo"
                          src="${invoiceStudio.logo_url}"
                          alt="${studioName}"
                        />
                      `
                      : ""
                  }

                  <div>
                    <h2 class="studio-name">
                      ${studioName}
                    </h2>

                    <div class="studio-info">
                      ${
                        address ||
                        ""
                      }
                      ${
                        invoiceStudio?.contact_phone
                          ? `<br />Phone: ${invoiceStudio.contact_phone}`
                          : ""
                      }
                      ${
                        invoiceStudio?.contact_email
                          ? `<br />Email: ${invoiceStudio.contact_email}`
                          : ""
                      }
                      ${
                        invoiceStudio?.tax_id
                          ? `<br />GST / Tax ID: ${invoiceStudio.tax_id}`
                          : ""
                      }
                    </div>
                  </div>
                </div>

                <div class="invoice-title">
                  <h1>INVOICE</h1>

                  <div class="invoice-number">
                    ${invoiceNumber}
                  </div>

                  <div class="meta">
                    Generated on
                    ${formatInvoiceDate(
                      new Date().toISOString(),
                    )}
                  </div>
                </div>
              </section>

              <section class="details">
                <div class="card">
                  <div class="label">
                    Event
                  </div>

                  <div class="value">
                    ${eventName}
                  </div>

                  <div class="meta">
                    ${
                      invoiceEvent?.code
                        ? `Event Code: ${invoiceEvent.code}`
                        : ""
                    }
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Client
                  </div>

                  <div class="value">
                    ${invoiceClient.name || "Client"}
                  </div>

                  <div class="meta">
                    ${
                      invoiceClient.phone
                        ? `Phone: ${invoiceClient.phone}`
                        : "Phone: Not available"
                    }
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Invoice Period
                  </div>

                  <div class="value">
                    ${
                      invoiceFromDate
                        ? formatInvoiceDate(invoiceFromDate)
                        : "All dates"
                    }
                    to
                    ${
                      invoiceToDate
                        ? formatInvoiceDate(invoiceToDate)
                        : "Present"
                    }
                  </div>

                  <div class="meta">
                    ${invoiceSummary.transactionCount} transaction(s) included
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Event Date
                  </div>

                  <div class="value">
                    ${formatInvoiceDate(
                      eventDate,
                    )}
                  </div>

                  <div class="meta">
                    Payment transaction statement
                  </div>
                </div>
              </section>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Transaction</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Reference / Notes</th>
                    <th style="text-align:right">
                      Amount
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  ${transactionsHtml}
                </tbody>
              </table>

              <section class="summary">
                <div class="summary-box">
                  <div class="summary-row">
                    <span>
                      Completed Payments
                    </span>

                    <strong>
                      ${formatCurrency(
                        invoiceSummary.totalReceived,
                        currency,
                      )}
                    </strong>
                  </div>

                  <div class="summary-row">
                    <span>
                      Pending Payments
                    </span>

                    <strong>
                      ${formatCurrency(
                        invoiceSummary.pending,
                        currency,
                      )}
                    </strong>
                  </div>

                  <div class="summary-row">
                    <span>
                      Total Transactions
                    </span>

                    <strong>
                      ${invoiceSummary.transactionCount}
                    </strong>
                  </div>
                </div>
              </section>

              <footer class="footer">
                This invoice is system generated and does not require a signature.
              </footer>
            </main>

            <script>
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      popup.document.close();
    } catch (
      invoiceError
    ) {
      const message =
        getErrorMessage(
          invoiceError,
        );

      console.error(
        "Failed to generate invoice",
    {
      eventId,

      error:
        invoiceError,

      message,
    },
  );

      setError(
        message,
      );
    } finally {
      setInvoiceLoading(
        false,
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Payment Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track payments and generate a professional event invoice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              void loadPayments(
                true,
              )
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
            <label className="text-xs font-medium text-slate-500">
              From
            </label>

            <input
              type="date"
              value={invoiceFromDate}
              onChange={(event) =>
                setInvoiceFromDate(
                  event.target.value,
                )
              }
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

            <label className="text-xs font-medium text-slate-500">
              To
            </label>

            <input
              type="date"
              value={invoiceToDate}
              onChange={(event) =>
                setInvoiceToDate(
                  event.target.value,
                )
              }
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void handleGenerateInvoice()
            }
            disabled={
              invoiceLoading
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invoiceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}

            Generate Invoice
          </button>

          <button
            type="button"
            onClick={
              openPaymentModal
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />

            Add Payment
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Received
            </p>

            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {formatCurrency(
              summary.totalReceived,
              studio?.currency ||
                "INR",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Completed payments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {formatCurrency(
              summary.pending,
              studio?.currency ||
                "INR",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pending or processing
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Failed / Cancelled
            </p>

            <div className="rounded-xl bg-red-50 p-2 text-red-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {formatCurrency(
              summary.failed,
              studio?.currency ||
                "INR",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Failed transactions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Transactions
            </p>

            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {summary.transactionCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total payment records
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              Transaction History
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              All recorded event payment transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleGenerateInvoice()
            }
            disabled={
              invoiceLoading
            }
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex"
          >
            <Printer className="h-4 w-4" />

            Print Invoice
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />

            Loading payment transactions...
          </div>
        ) : payments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <CreditCard className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No payment transactions yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add the first payment received for this event.
            </p>

            <button
              type="button"
              onClick={
                openPaymentModal
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transaction
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map(
                  (
                    payment,
                  ) => (
                    <tr
                      key={
                        payment.id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {payment.transaction_id ||
                            payment.payment_number ||
                            "Manual Payment"}
                        </div>

                        {payment.gateway_name ||
                        payment.notes ||
                        payment.remarks ? (
                          <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {payment.gateway_name ||
                              payment.notes ||
                              payment.remarks}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <span className="text-slate-500">
                            {getMethodIcon(
                              payment.method,
                            )}
                          </span>

                          {getMethodLabel(
                            payment.method,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          getPaymentDate(
                            payment,
                          ),
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          getAmount(
                            payment,
                          ),
                          payment.currency ||
                            studio?.currency ||
                            "INR",
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                            payment.status,
                          )}`}
                        >
                          {payment.status ||
                            "unknown"}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add Payment
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Record a payment received for this event.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closePaymentModal
                }
                disabled={
                  saving
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                handleCreatePayment
              }
              className="space-y-5 px-6 py-6"
            >
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={
                    (event) =>
                      updateForm(
                        "amount",
                        event.target.value,
                      )
                  }
                  placeholder="0.00"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={
                    form.method
                  }
                  onChange={
                    (event) => {
                      const method =
                        event.target
                          .value as PaymentMethod;

                      updateForm(
                        "method",
                        method,
                      );

                      if (
                        method === "cash"
                      ) {
                        updateForm(
                          "transactionId",
                          "",
                        );

                        updateForm(
                          "gatewayName",
                          "",
                        );
                      }
                    }
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="cash">
                    Cash
                  </option>

                  <option value="upi">
                    UPI
                  </option>

                  <option value="bank_transfer">
                    Bank Transfer
                  </option>

                  <option value="credit_card">
                    Credit Card
                  </option>

                  <option value="debit_card">
                    Debit Card
                  </option>

                  <option value="net_banking">
                    Net Banking
                  </option>

                  <option value="cheque">
                    Cheque
                  </option>

                  <option value="wallet">
                    Wallet
                  </option>

                  <option value="online_gateway">
                    Online Gateway
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              {form.method ===
              "upi" ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    UPI App / Gateway
                  </label>

                  <select
                    value={
                      form.gatewayName
                    }
                    onChange={
                      (event) =>
                        updateForm(
                          "gatewayName",
                          event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">
                      Select app
                    </option>

                    <option value="Google Pay">
                      Google Pay
                    </option>

                    <option value="PhonePe">
                      PhonePe
                    </option>

                    <option value="Paytm">
                      Paytm
                    </option>

                    <option value="BHIM">
                      BHIM
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              ) : null}

              {requiresTransactionId(
                form.method,
              ) ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Transaction ID
                  </label>

                  <input
                    type="text"
                    value={
                      form.transactionId
                    }
                    onChange={
                      (event) =>
                        updateForm(
                          "transactionId",
                          event.target.value,
                        )
                    }
                    placeholder="Enter transaction reference"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Cash payments do not require a transaction ID.
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Payment Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.paymentDate
                  }
                  onChange={
                    (event) =>
                      updateForm(
                        "paymentDate",
                        event.target.value,
                      )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={
                    form.notes
                  }
                  onChange={
                    (event) =>
                      updateForm(
                        "notes",
                        event.target.value,
                      )
                  }
                  placeholder="Optional notes"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={
                    closePaymentModal
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />

                      Save Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}