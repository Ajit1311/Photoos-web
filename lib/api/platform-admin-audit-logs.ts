import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const FUNCTION_URL =
  getSupabaseFunctionUrl("platform-admin-audit-logs");

export type AuditLog = {
  id: string;
  platform_admin_id: string;
  action: string;
  module: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  total_count: number;
};

export type AuditStatistics = {
  total_events: number;
  today: number;
  last_7_days: number;
  last_30_days: number;
  unique_admins: number;
  unique_actions: number;
  unique_modules: number;
  latest_event: string | null;
};

export type AuditFilterOptions = {
  actions: string[];
  modules: string[];
  target_types: string[];
};

async function request<T>(
  params: Record<string, string>,
): Promise<T> {
  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Platform admin session expired.",
    );
  }

  const searchParams =
    new URLSearchParams(params);

  const response = await fetch(
    `${FUNCTION_URL}?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result?.error?.message ??
        "Audit request failed.",
    );
  }

  return result.data as T;
}

export async function listAuditLogs(
  options: {
    action?: string;
    module?: string;
    targetType?: string;
    keyword?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  return request<AuditLog[]>({
    action: "list",
    ...(options.action
      ? { action_filter: options.action }
      : {}),
    ...(options.module
      ? { module: options.module }
      : {}),
    ...(options.targetType
      ? { target_type: options.targetType }
      : {}),
    ...(options.keyword
      ? { keyword: options.keyword }
      : {}),
    ...(options.from
      ? { from: options.from }
      : {}),
    ...(options.to
      ? { to: options.to }
      : {}),
    limit: String(
      options.limit ?? 50,
    ),
    offset: String(
      options.offset ?? 0,
    ),
  });
}

export async function getAuditLog(
  id: string,
) {
  return request<AuditLog[]>({
    action: "get",
    id,
  });
}

export async function getAuditStatistics() {
  return request<AuditStatistics>({
    action: "statistics",
  });
}

export async function getAuditFilterOptions() {
  return request<AuditFilterOptions>({
    action: "filter-options",
  });
}
