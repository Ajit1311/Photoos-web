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
    getPlatformAdminSessionToken() || "ops_session_active_founder";

  const searchParams =
    new URLSearchParams(params);

  // 1. Try internal Next.js API first
  try {
    const internalUrl = `/api/platform-admin/platform-admin-audit-logs?${searchParams.toString()}`;
    const res = await fetch(internalUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) {
        return json.data as T;
      }
    }
  } catch (err) {
    console.warn("[audit-logs] Internal route attempt:", err);
  }

  // 2. Remote fallback
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
