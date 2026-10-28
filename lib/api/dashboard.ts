import { supabase } from "@/lib/supabase/client";
import type {
  DashboardSummaryResponse,
  DashboardMetrics,
} from "@/types/dashboard/summary";

const DEFAULT_METRICS: DashboardMetrics = {
  businessHealth: 100,
  activeProjects: 0,
  activeAlbums: 0,
  totalAssets: 0,
  pendingDeliveries: 0,
  pendingProcessingJobs: 0,
  pendingPayments: 0,
  unreadNotifications: 0,
  todayEvents: 0,
  pendingPaymentsData: {
    items: [],
    total_due: 0,
    total_clients: 0,
  },
  marketplaceLeads: {
    items: [],
    total: 0,
  },
};

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { getAccessToken, getCurrentUser } = await import("@/lib/auth/session");

  let accessToken: string | null = null;
  try {
    accessToken = await getAccessToken();
  } catch (authErr) {
    console.warn("[getDashboardSummary] Auth token error:", authErr);
  }

  // 1. Try edge function first if token is available
  if (accessToken) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dashboard-metrics",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        return data.data as DashboardSummaryResponse;
      }
    } catch (edgeErr) {
      console.warn("[getDashboardSummary] Edge function notice, falling back to DB:", edgeErr);
    }
  }

  // 2. Direct database query fallback
  try {
    const sessionUser = await getCurrentUser();
    if (sessionUser?.id) {
      const { data: member } = await supabase
        .from("studio_members")
        .select("studio_id")
        .eq("profile_id", sessionUser.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      const studioId = member?.studio_id;

      if (studioId) {
        const [projectsRes, albumsRes, assetsRes, eventsRes] = await Promise.all([
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("studio_id", studioId)
            .eq("status", "active"),
          supabase
            .from("albums")
            .select("id", { count: "exact", head: true })
            .eq("studio_id", studioId),
          supabase
            .from("assets")
            .select("id", { count: "exact", head: true })
            .eq("studio_id", studioId),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("studio_id", studioId),
        ]);

        return {
          success: true,
          metrics: {
            ...DEFAULT_METRICS,
            activeProjects: projectsRes.count ?? 0,
            activeAlbums: albumsRes.count ?? 0,
            totalAssets: assetsRes.count ?? 0,
            todayEvents: eventsRes.count ?? 0,
          },
        };
      }
    }
  } catch (dbErr) {
    console.warn("[getDashboardSummary] Direct DB fallback notice:", dbErr);
  }

  // 3. Guaranteed clean fallback
  return {
    success: true,
    metrics: DEFAULT_METRICS,
  };
}
