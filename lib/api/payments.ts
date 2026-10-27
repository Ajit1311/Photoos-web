import { supabase } from "@/lib/supabase/client";

import {
  getSubscriptionPlans,
} from "@/lib/api/subscription/plans";

import type {
  PaymentGateway,
  PaymentMethod,
  PaymentMode,
  PaymentRefund,
  PaymentRefundStatus,
  PaymentStatus,
  PaymentTransaction,
  PaymentType,
  RefundPaymentInput,
  PaymentRefundSummary,
  CreatePaymentInput,
} from "@/types/payment";

import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
type PaymentRow = {
  id: string;
  studio_id: string;

  client_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  project_id: string | null;
  invoice_id: string | null;

  created_by: string | null;
  updated_by: string | null;

  payment_number: number;

  reference_type: string | null;
  reference_id: string | null;

  payment_type: string;
  payment_mode: string;
  status: string;
  method: string;

  amount: number | string;
  tax_amount: number | string | null;
  total_amount: number | string;

  currency: string;

  transaction_id: string | null;

  payment_date: string | null;
  due_date: string | null;

  notes: string | null;

  metadata: Record<string, unknown> | null;
  custom_fields: Record<string, unknown> | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
};

type PaymentRefundRow = {
  id: string;

  studio_id: string;
  payment_id: string;
  client_id: string | null;

  refund_number: number;

  amount: number | string;
  currency: string;

  reason: string;
  notes: string | null;

  status: string;

  refunded_by: string | null;
  refunded_at: string;

  payment_method: string | null;

  gateway: string | null;

  gateway_transaction_id: string | null;

  metadata: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
};

function toNumber(
  value: number | string | null | undefined,
): number {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function mapPayment(
  row: PaymentRow,
): PaymentTransaction {
  return {
    id: row.id,

    studioId:
      row.studio_id,

    clientId:
      row.client_id,

    clientName:
      null,

    contactId:
      row.contact_id,

    companyId:
      row.company_id,

    projectId:
      row.project_id,

    invoiceId:
      row.invoice_id,

    paymentNumber:
      row.payment_number,

    referenceType:
      row.reference_type,

    referenceId:
      row.reference_id,

    paymentType:
      row.payment_type as PaymentType,

    paymentMode:
      row.payment_mode as PaymentMode,

    status:
      row.status as PaymentStatus,

    method:
      row.method as PaymentMethod,

    amount:
      toNumber(
        row.amount,
      ),

    taxAmount:
      toNumber(
        row.tax_amount,
      ),

    totalAmount:
      toNumber(
        row.total_amount,
      ),

    currency:
      row.currency,

    transactionId:
      row.transaction_id,

    paymentDate:
      row.payment_date,

    dueDate:
      row.due_date,

    notes:
      row.notes,

    metadata:
      row.metadata ?? {},

    customFields:
      row.custom_fields ?? {},

    isActive:
      row.is_active,

    createdBy:
      row.created_by,

    updatedBy:
      row.updated_by,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function mapPaymentRefund(
  row: PaymentRefundRow,
): PaymentRefund {
  return {
    id:
      row.id,

    studioId:
      row.studio_id,

    paymentId:
      row.payment_id,

    clientId:
      row.client_id,

    amount:
      toNumber(
        row.amount,
      ),

    currency:
      row.currency,

    reason:
      row.reason,

    notes:
      row.notes,

    status:
      row.status as PaymentRefundStatus,

    paymentMethod:
      row.payment_method
        ? row.payment_method as PaymentMethod
        : null,

    gateway:
      row.gateway
        ? row.gateway as PaymentGateway
        : null,

    gatewayTransactionId:
      row.gateway_transaction_id,

    metadata:
      row.metadata ?? {},

    processedAt:
      row.refunded_at,

    processedBy:
      row.refunded_by,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

async function getPaymentDashboardData(): Promise<{
  payments: PaymentTransaction[];
  refunds: PaymentRefund[];
}> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "payment-dashboard-worker",
    {
      body: {},
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.message ??
        "Unable to load payment dashboard.",
    );
  }

  const paymentRows =
    Array.isArray(data?.data?.payments)
      ? data.data.payments
      : [];

  const refundRows =
    Array.isArray(data?.data?.refunds)
      ? data.data.refunds
      : [];

  return {
    payments:
      paymentRows.map(
        (row: PaymentRow) =>
          mapPayment(row),
      ),

    refunds:
      refundRows.map(
        (row: PaymentRefundRow) =>
          mapPaymentRefund(row),
      ),
  };
}

export async function getPayments(): Promise<
  PaymentTransaction[]
> {
  const dashboard =
    await getPaymentDashboardData();

  return dashboard.payments;
}

export async function getPaymentRefunds(): Promise<
  PaymentRefund[]
> {
  const dashboard =
    await getPaymentDashboardData();

  return dashboard.refunds;
}

export async function getPaymentDashboardDataForWorkspace(): Promise<{
  payments: PaymentTransaction[];
  refunds: PaymentRefund[];
}> {
  return getPaymentDashboardData();
}


async function resolveActiveStudioId(): Promise<string> {

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      userError.message,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to create a payment.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!data?.studio_id) {
    throw new Error(
      "No active studio was found for the signed-in user.",
    );
  }

  return data.studio_id;
}


export async function createPayment(
  input: CreatePaymentInput,
): Promise<PaymentTransaction> {

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      userError.message,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to create a payment.",
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_payment",
    {
      p_studio_id:
        await resolveActiveStudioId(),

      p_client_id:
        input.clientId,

      p_contact_id:
        null,

      p_company_id:
        null,

      p_project_id:
        input.projectId ?? null,

      p_invoice_id:
        input.invoiceId ?? null,

      p_reference_type:
        input.referenceType ?? null,

      p_reference_id:
        input.referenceId ?? null,

      p_payment_type:
        input.paymentType,

      p_payment_mode:
        input.paymentMode,

      p_status:
        "completed",

      p_method:
        input.method,

      p_amount:
        input.amount,

      p_tax_amount:
        input.taxAmount ?? 0,

      p_total_amount:
        input.totalAmount ??
        input.amount,

      p_currency:
        input.currency ?? "INR",

      p_transaction_id:
        input.transactionId ?? null,

      p_payment_date:
        input.paymentDate ?? null,

      p_due_date:
        input.dueDate ?? null,

      p_notes:
        input.notes ?? null,

      p_metadata:
        input.metadata ?? {},

      p_custom_fields:
        input.customFields ?? {},

      p_created_by:
        user.id,
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Invalid payment creation response.",
    );
  }

  return mapPayment(
    data as PaymentRow,
  );
}

export async function updatePayment(
  input: {
    paymentId: string;
    referenceType?: string | null;
    referenceId?: string | null;
    paymentType: PaymentType;
    paymentMode: PaymentMode;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    taxAmount?: number | null;
    totalAmount?: number | null;
    currency?: string | null;
    transactionId?: string | null;
    paymentDate?: string | null;
    dueDate?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
    customFields?: Record<string, unknown>;
  },
): Promise<PaymentTransaction> {

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      userError.message,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to update a payment.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_payment",
      {
        p_payment_id:
          input.paymentId,

        p_reference_type:
          input.referenceType ?? null,

        p_reference_id:
          input.referenceId ?? null,

        p_payment_type:
          input.paymentType,

        p_payment_mode:
          input.paymentMode,

        p_status:
          input.status,

        p_method:
          input.method,

        p_amount:
          input.amount,

        p_tax_amount:
          input.taxAmount ?? 0,

        p_total_amount:
          input.totalAmount ??
          input.amount,

        p_currency:
          input.currency ?? "INR",

        p_transaction_id:
          input.transactionId ?? null,

        p_payment_date:
          input.paymentDate ?? null,

        p_due_date:
          input.dueDate ?? null,

        p_notes:
          input.notes ?? null,

        p_metadata:
          input.metadata ?? {},

        p_custom_fields:
          input.customFields ?? {},

        p_updated_by:
          user.id,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Invalid payment update response.",
    );
  }

  return mapPayment(
    data as PaymentRow,
  );
}


export async function createPaymentRefund(
  input: RefundPaymentInput,
): Promise<PaymentRefund> {
  const amount =
    Number(
      input.amount,
    );

  if (
    !Number.isFinite(
      amount,
    ) ||
    amount <= 0
  ) {
    throw new Error(
      "Refund amount must be greater than zero.",
    );
  }

  const reason =
    input.reason.trim();

  if (!reason) {
    throw new Error(
      "Refund reason is required.",
    );
  }

  const transactionReference =
    input.transactionReference?.trim() ||
    null;

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_payment_refund",
    {
      p_payment_id:
        input.paymentId,

      p_amount:
        amount,

      p_reason:
        reason,

      p_notes:
        input.notes?.trim() ||
        null,
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const refundId =
    typeof data === "string"
      ? data
      : String(
          data,
        );

  const {
    error: updateError,
  } = await supabase
    .from(
      "payment_refunds",
    )
    .update({
      payment_method:
        input.refundMethod,

      gateway:
        input.gateway ??
        "manual",

      gateway_transaction_id:
        transactionReference,
    })
    .eq(
      "id",
      refundId,
    );

  if (updateError) {
    throw new Error(
      updateError.message,
    );
  }

  const {
    data: refundData,
    error: refundError,
  } = await supabase
    .from(
      "payment_refunds",
    )
    .select(`
      id,
      studio_id,
      payment_id,
      client_id,
      refund_number,
      amount,
      currency,
      reason,
      notes,
      status,
      refunded_by,
      refunded_at,
      payment_method,
      gateway,
      gateway_transaction_id,
      metadata,
      created_at,
      updated_at
    `)
    .eq(
      "id",
      refundId,
    )
    .single();

  if (refundError) {
    throw new Error(
      refundError.message,
    );
  }

  return mapPaymentRefund(
    refundData as PaymentRefundRow,
  );
}


export async function getPaymentRefundSummary(
  paymentId: string
): Promise<PaymentRefundSummary> {
  const { data, error } = await supabase.rpc(
    "get_payment_refund_summary",
    {
      p_payment_id: paymentId,
    }
  );

  if (error) {
    throw error;
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("Payment refund summary was not found.");
  }

  return data[0] as PaymentRefundSummary;
}


export type SubscriptionRenewalResult = {
  payment_id: string;
  transaction_payment_id?: string | null;

  subscription_id: string;

  amount: number;
  currency: string;

  plan_id: string;
  plan_code: string;
  plan_name: string;

  billing_cycle: string;

  payment_required: boolean;

  subscription_status: string;
};


export async function requestSubscriptionRenewal(
  subscriptionId: string,
): Promise<SubscriptionRenewalResult> {

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (
    userError
  ) {

    throw new Error(
      userError.message,
    );

  }


  if (
    !user
  ) {

    throw new Error(
      "You must be signed in to renew your subscription.",
    );

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "request_subscription_renewal",
      {
        p_subscription_id:
          subscriptionId,

        p_created_by:
          user.id,
      },
    );


  if (
    error
  ) {

    throw new Error(
      error.message,
    );

  }


  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "Invalid subscription renewal response.",
    );

  }


  return data as SubscriptionRenewalResult;

}


export async function verifySubscriptionPayment(
  paymentId: string,
  transactionId: string,
): Promise<PaymentTransaction> {

  const {
    getFirebaseIdToken,
  } =
    await import(
      "@/lib/auth/firebase-auth.service"
    );

  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to verify the subscription payment.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "verify-subscription-payment",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        body: {
          payment_id:
            paymentId,

          gateway_transaction_id:
            transactionId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (
    !data?.success ||
    !data?.data?.payment
  ) {
    throw new Error(
      data?.error?.message ??
        data?.error ??
        "Subscription payment verification failed.",
    );
  }

  return mapPayment(
    data.data.payment as PaymentRow,
  );
}


export type SubscriptionUpgradePaymentResult = {
  payment_id: string;
  transaction_payment_id?: string | null;

  subscription_id: string;

  amount: number;
  currency: string;

  plan_id: string;
  plan_code: string;
  plan_name: string;

  billing_cycle: string;

  payment_required: boolean;

  subscription_status: string;

  target_plan_id?: string;
  target_plan_code?: string;

  reused_existing_payment?: boolean;
};


export async function createSubscriptionUpgradePayment(
  subscriptionId: string,
  targetPlanCode: string,
): Promise<SubscriptionUpgradePaymentResult> {

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (
    userError
  ) {

    throw new Error(
      userError.message,
    );

  }


  if (
    !user
  ) {

    throw new Error(
      "You must be signed in to upgrade your subscription.",
    );

  }


  const plans =
    await getSubscriptionPlans();


  const targetPlan =
    plans.find(
      (
        plan,
      ) =>
        plan.plan_code ===
        targetPlanCode,
    );


  if (
    !targetPlan
  ) {

    throw new Error(
      "Selected subscription plan was not found.",
    );

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_subscription_upgrade_payment",
      {
        p_subscription_id:
          subscriptionId,

        p_new_plan_id:
          targetPlan.id,

        p_created_by:
          user.id,
      },
    );


  if (
    error
  ) {

    throw new Error(
      error.message,
    );

  }


  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "Invalid subscription upgrade payment response.",
    );

  }


  return data as SubscriptionUpgradePaymentResult;
}


export async function verifySubscriptionUpgradePayment(
  paymentId: string,
  transactionId: string,
): Promise<Record<string, unknown>> {

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (
    userError
  ) {

    throw new Error(
      userError.message,
    );

  }


  if (
    !user
  ) {

    throw new Error(
      "You must be signed in to verify the subscription upgrade payment.",
    );

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "verify_subscription_upgrade_payment",
      {
        p_payment_id:
          paymentId,

        p_gateway_transaction_id:
          transactionId,

        p_verified_by:
          user.id,
      },
    );


  if (
    error
  ) {

    throw new Error(
      error.message,
    );

  }


  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "Invalid subscription upgrade verification response.",
    );

  }


  return data as Record<string, unknown>;
}
