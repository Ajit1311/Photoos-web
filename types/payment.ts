export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "net_banking"
  | "credit_card"
  | "debit_card"
  | "phonepe"
  | "google_pay"
  | "cheque"
  | "other";

export type PaymentMode =
  | "incoming"
  | "outgoing";

export type PaymentType =
  | "full_payment"
  | "advance"
  | "partial"
  | "installment"
  | "refund"
  | "other";

export type PaymentGateway =
  | "manual"
  | "phonepe"
  | "google_pay"
  | "razorpay"
  | "paytm"
  | "stripe"
  | "cashfree"
  | "other";

export type PaymentTransaction = {
  id: string;
  studioId: string;

  clientId: string | null;
  clientName: string | null;

  contactId: string | null;
  companyId: string | null;
  projectId: string | null;
  invoiceId: string | null;

  paymentNumber: number;

  referenceType: string | null;
  referenceId: string | null;

  paymentType: PaymentType;
  paymentMode: PaymentMode;
  status: PaymentStatus;

  method: PaymentMethod;

  amount: number;
  taxAmount: number;
  totalAmount: number;

  currency: string;

  transactionId: string | null;

  paymentDate: string | null;
  dueDate: string | null;

  notes: string | null;

  metadata: Record<string, unknown>;
  customFields: Record<string, unknown>;

  isActive: boolean;

  createdBy: string | null;
  updatedBy: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PaymentRefundStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type PaymentRefund = {
  id: string;
  studioId: string;
  paymentId: string;
  clientId: string | null;

  amount: number;
  currency: string;

  reason: string;
  notes: string | null;

  status: PaymentRefundStatus;

  paymentMethod: PaymentMethod | null;

  gateway: PaymentGateway | null;

  gatewayTransactionId: string | null;

  metadata: Record<string, unknown>;

  processedAt: string | null;
  processedBy: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PaymentHistory = {
  id: string;
  paymentId: string;

  eventName: string;
  eventType: string;
  action: string | null;

  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;

  remarks: string | null;

  metadata: Record<string, unknown>;

  createdBy: string | null;

  createdAt: string;
};

export type PaymentDashboardSummary = {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;

  totalReceived: number;
  totalRefunded: number;
  netRevenue: number;

  currency: string;
};

export type PaymentClientOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export type CreatePaymentInput = {
  clientId: string | null;

  paymentType: PaymentType;
  paymentMode: PaymentMode;
  method: PaymentMethod;

  amount: number;

  taxAmount?: number;
  totalAmount?: number;

  currency?: string;

  transactionId?: string | null;

  paymentDate?: string | null;
  dueDate?: string | null;

  notes?: string | null;

  projectId?: string | null;
  invoiceId?: string | null;

  referenceType?: string | null;
  referenceId?: string | null;

  metadata?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
};

export type UpdatePaymentInput = {
  paymentId: string;

  clientId?: string | null;

  paymentType?: PaymentType;
  paymentMode?: PaymentMode;
  method?: PaymentMethod;

  status?: PaymentStatus;

  amount?: number;
  taxAmount?: number;
  totalAmount?: number;

  currency?: string;

  transactionId?: string | null;

  paymentDate?: string | null;
  dueDate?: string | null;

  notes?: string | null;

  projectId?: string | null;
  invoiceId?: string | null;
};

export type RefundPaymentInput = {
  paymentId: string;

  amount: number;

  reason: string;

  notes?: string | null;

  refundMethod: PaymentMethod;

  transactionReference?: string | null;

  gateway?: PaymentGateway | null;

  paymentMethod?: PaymentMethod;

  gatewayTransactionId?: string | null;
};


export type PaymentRefundSummary = {
  payment_id: string;
  studio_id: string;
  payment_number: number;
  currency: string;
  payment_amount: number;
  payment_status: PaymentStatus;
  total_refunded_amount: number;
  remaining_refundable_amount: number;
  refund_count: number;
  can_refund: boolean;
};
