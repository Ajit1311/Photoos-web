export type PendingPaymentItem = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  invoice_id: string | null;
  invoice_number: number | null;
  balance_amount: number;
  amount_due: number;
  total_amount: number;
  due_date: string | null;
  status: string | null;
  payment_status: string | null;
};

export type PendingPaymentsData = {
  items: PendingPaymentItem[];
  total_due: number;
  total_clients: number;
};

export type MarketplaceLeadItem = {
  id: string;
  status: string;
  currency: string;
  order_id: string;
  created_at: string;
  order_number: string;
  order_status: string;
  total_amount: number;
  requested_date: string | null;
  customer_message: string | null;
  requested_start_time: string | null;
  requested_end_time: string | null;
};

export type MarketplaceLeadsData = {
  items: MarketplaceLeadItem[];
  total: number;
};

export type DashboardMetrics = {
  businessHealth: number;

  activeProjects: number;

  activeAlbums: number;

  totalAssets: number;

  pendingDeliveries: number;

  pendingProcessingJobs: number;

  pendingPayments: number;

  unreadNotifications: number;

  todayEvents: number;

  pendingPaymentsData: PendingPaymentsData;

  marketplaceLeads: MarketplaceLeadsData;
};

export type DashboardSummaryResponse = {
  success: boolean;

  metrics: DashboardMetrics;
};
