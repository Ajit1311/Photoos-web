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
};

export type DashboardSummaryResponse = {
  success: boolean;

  metrics: DashboardMetrics;
};