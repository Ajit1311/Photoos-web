
export type ReportPeriod = {
  from_date:
    string;

  to_date:
    string;
};


export type StudioReportsSummary = {
  total_events:
    number;

  active_events:
    number;

  completed_events:
    number;

  total_clients:
    number;

  total_assets:
    number;

  total_storage_bytes:
    number;
};


export type StudioReport = {
  period:
    ReportPeriod;

  summary:
    StudioReportsSummary;

  [key:
    string]:
    unknown;
};


export type MonthlyRevenue = {
  month:
    string;

  revenue:
    number;
};


export type FinancialReportSummary = {
  total_invoiced:
    number;

  total_received:
    number;

  total_pending:
    number;

  total_overdue:
    number;
};


export type StudioFinancialReport = {
  period:
    ReportPeriod;

  summary:
    FinancialReportSummary;

  monthly_revenue:
    MonthlyRevenue[];

  payment_status:
    Record<
      string,
      number
    >;
};

export type TeamPerformanceMember = {
  member_id:
    string
    | null;

  member_name:
    string;

  member_email:
    string
    | null;

  role_name:
    string
    | null;

  assigned_events:
    number;

  completed_events:
    number;

  active_events:
    number;

  assigned_projects:
    number;

  completed_projects:
    number;

  assets_processed:
    number;

  kpi_score:
    number;

  kra_score:
    number;

  performance_score:
    number;
};


export type StudioTeamPerformanceSummary = {
  total_members:
    number;

  average_kpi_score:
    number;

  average_kra_score:
    number;

  average_performance_score:
    number;

  top_performer:
    string
    | null;
};


export type StudioTeamPerformanceReport = {
  period:
    ReportPeriod;

  summary:
    StudioTeamPerformanceSummary;

  members:
    TeamPerformanceMember[];
};

