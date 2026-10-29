import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";

const EDGE_FUNCTION_URL = "/api/platform-admin/platform-admin-security-logs";

export type SecurityLog = {
  id: string;
  platform_admin_id: string | null;
  event_type: string;
  event_category: string;
  success: boolean;
  failure_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  total_count?: number;
};

export type SecurityStatistics = {
  total_events: number;
  today: number;
  last_7_days: number;
  last_30_days: number;
  successful_events: number;
  failed_events: number;
  unique_ips: number;
  unique_event_types: number;
  latest_event: string | null;
};

export type SecurityFilterOptions = {
  event_types: string[];
  event_categories: string[];
};

type ListParams = {
  eventType?: string;
  eventCategory?: string;
  success?: boolean;
  keyword?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

async function request<T>(
  query: string,
): Promise<T> {
  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Admin session required.",
    );
  }

  const response = await fetch(
    `${EDGE_FUNCTION_URL}?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.error?.message ??
        result?.message ??
        "Unable to load security logs.",
    );
  }

  return result.data as T;
}

export async function listSecurityLogs(
  params: ListParams = {},
) {
  const query =
    new URLSearchParams();

  query.set("action", "list");

  if (params.eventType)
    query.set(
      "event_type",
      params.eventType,
    );

  if (params.eventCategory)
    query.set(
      "event_category",
      params.eventCategory,
    );

  if (params.success !== undefined)
    query.set(
      "success",
      String(params.success),
    );

  if (params.keyword)
    query.set(
      "keyword",
      params.keyword,
    );

  if (params.from)
    query.set("from", params.from);

  if (params.to)
    query.set("to", params.to);

  query.set(
    "limit",
    String(params.limit ?? 50),
  );

  query.set(
    "offset",
    String(params.offset ?? 0),
  );

  return request<SecurityLog[]>(
    query.toString(),
  );
}

export async function getSecurityStatistics() {
  return request<SecurityStatistics>(
    "action=statistics",
  );
}

export async function getSecurityFilterOptions() {
  return request<SecurityFilterOptions>(
    "action=filter-options",
  );
}

export async function getSecurityLog(
  id: string,
) {
  const securityLogId = id?.trim();

  if (!securityLogId) {
    throw new Error("Security log id is required.");
  }

  return request<SecurityLog>(
    `action=get&security_log_id=${encodeURIComponent(securityLogId)}`,
  );
}
