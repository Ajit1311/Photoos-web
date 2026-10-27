import { supabase } from "@/lib/supabase/client";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EventPaymentMethod =
  | "cash"
  | "bank_transfer"
  | "upi"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "cheque"
  | "wallet"
  | "online_gateway"
  | "other";

export type EventPaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export type EventPayment = {
  id: string;

  event_id: string;

  payment_id: string;

  studio_id: string;

  client_id: string | null;

  project_id: string | null;

  amount: number;

  currency: string;

  method: EventPaymentMethod;

  status: EventPaymentStatus;

  transaction_id: string | null;

  gateway_name: string | null;

  payment_date: string | null;

  transaction_date: string | null;

  notes: string | null;

  remarks: string | null;

  created_at: string;

  metadata?: Record<string, unknown>;
};

type ListEventPaymentsRpcResponse = {
  success?: boolean;

  event_id?: string;

  payments?: EventPayment[];

  total_amount?: number | string;

  paid_amount?: number | string;

  pending_amount?: number | string;
};

export type EventPaymentsResult = {
  success: boolean;

  event_id: string;

  payments: EventPayment[];

  total_amount: number;

  paid_amount: number;

  pending_amount: number;
};

export type CreateEventPaymentInput = {
  eventId: string;

  amount: number;

  method: EventPaymentMethod;

  transactionId?: string | null;

  gatewayName?: string | null;

  paymentDate?: string | null;

  notes?: string | null;

  status?: EventPaymentStatus;

  metadata?: Record<string, unknown>;
};

type CreateEventPaymentRpcResponse = {
  success?: boolean;

  payment?: EventPayment;

  payment_id?: string;

  transaction_id?: string;

  message?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toNumber(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsed =
      Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function normalizePayment(
  value: EventPayment,
): EventPayment {
  return {
    ...value,

    amount:
      toNumber(
        value.amount,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* List Event Payments                                                        */
/* -------------------------------------------------------------------------- */

export async function listEventPayments(
  eventId: string,
): Promise<EventPaymentsResult> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "list_event_payments",
    {
      p_event_id:
        eventId,
    },
  );

  if (error) {
    console.error(
      "Failed to list event payments",
      {
        eventId,
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
        code:
          error.code,
      },
    );

    throw error;
  }

  const result =
    (data ?? {}) as
      ListEventPaymentsRpcResponse;

  const payments =
    Array.isArray(
      result.payments,
    )
      ? result.payments.map(
          normalizePayment,
        )
      : [];

  return {
    success:
      result.success ??
      true,

    event_id:
      result.event_id ??
      eventId,

    payments,

    total_amount:
      toNumber(
        result.total_amount,
      ),

    paid_amount:
      toNumber(
        result.paid_amount,
      ),

    pending_amount:
      toNumber(
        result.pending_amount,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Create Event Payment                                                       */
/* -------------------------------------------------------------------------- */

export async function createEventPayment(
  input: CreateEventPaymentInput,
): Promise<CreateEventPaymentRpcResponse> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_event_payment",
    {
      p_event_id:
        input.eventId,

      p_amount:
        input.amount,

      p_method:
        input.method,

      p_transaction_id:
        input.transactionId?.trim() ||
        null,

      p_gateway_name:
        input.gatewayName?.trim() ||
        null,

      p_payment_date:
        input.paymentDate ||
        new Date().toISOString(),

      p_notes:
        input.notes?.trim() ||
        null,

      p_status:
        input.status ??
        "completed",

      p_metadata:
        input.metadata ??
        {},
    },
  );

  if (error) {
    console.error(
      "Failed to create event payment",
      {
        eventId:
          input.eventId,

        amount:
          input.amount,

        method:
          input.method,

        message:
          error.message,

        details:
          error.details,

        hint:
          error.hint,

        code:
          error.code,
      },
    );

    throw error;
  }

  return (
    data ??
    {
      success: true,
    }
  ) as CreateEventPaymentRpcResponse;
}