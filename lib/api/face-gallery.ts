import {
  supabase,
} from "@/lib/supabase/client";

import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";

import type {
  FaceGalleryDashboardData,
  FaceGalleryDelivery,
  FaceGalleryEnrollment,
  FaceGalleryLifecycleSummary,
  FaceGalleryMatch,
} from "@/types/face-gallery";


type EnrollmentRow = {
  id: string;

  workspace_id: string;

  client_id: string | null;

  enrollment_status: string;

  created_at: string;
};


type MatchRow = {
  match_id: string;

  enrollment_id: string;

  asset_id: string | null;

  similarity_score:
    | number
    | string
    | null;

  match_threshold:
    | number
    | string
    | null;

  is_match: boolean;

  match_status: string;

  matched_at: string | null;
};


type DeliveryRow = {
  delivery_id: string;

  workspace_id: string;

  enrollment_id: string;

  result_id: string;

  asset_id: string;

  delivery_status: string;

  delivered_at: string | null;

  revoked_at: string | null;

  revoked_reason: string | null;

  created_at: string;
};


type LifecycleSummaryRow = {
  enrollment_id: string;

  workspace_id: string;

  total_lifecycle_events:
    | number
    | string;

  created_events:
    | number
    | string;

  delivered_events:
    | number
    | string;

  revoked_events:
    | number
    | string;

  restored_events:
    | number
    | string;

  accessed_events:
    | number
    | string;

  latest_lifecycle_event_at:
    string
    | null;
};


function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {

  if (
    typeof value ===
    "number"
  ) {

    return value;

  }


  if (
    typeof value ===
    "string"
  ) {

    const parsed =
      Number(
        value,
      );


    return Number.isNaN(
      parsed,
    )
      ? 0
      : parsed;

  }


  return 0;

}


function normalizeRows<T>(
  data:
    | T
    | T[]
    | null
    | undefined,
): T[] {

  if (
    Array.isArray(
      data,
    )
  ) {

    return data;

  }


  if (
    data &&
    typeof data ===
      "object"
  ) {

    return [
      data,
    ];

  }


  return [];

}


// ============================================================================
// FACE GALLERY DASHBOARD
// ============================================================================

export async function
getFaceGalleryDashboardData(
  workspaceId: string,
): Promise<
  FaceGalleryDashboardData
> {
  const emptyState: FaceGalleryDashboardData = {
    workspaceId: workspaceId || "",
    enrollments: [],
    matches: [],
    deliveries: [],
    lifecycleSummaries: [],
    metrics: {
      enrollments: 0,
      matchedResults: 0,
      deliveries: 0,
      lifecycleEvents: 0,
    },
  };

  if (!workspaceId) {
    return emptyState;
  }

  // 1. Try edge function if available
  try {
    let accessToken: string | null = null;
    try {
      const { getAccessToken } = await import("@/lib/auth/session");
      accessToken = await getAccessToken();
    } catch {
      // Fallback
    }

    if (!accessToken) {
      try {
        accessToken = await getFirebaseIdToken();
      } catch {
        // Fallback
      }
    }

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "face-gallery-workspace",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            workspace_id: workspaceId,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        const payload = data.data;
        const enrollmentRows = normalizeRows<EnrollmentRow>(payload.enrollments);
        const enrollments = enrollmentRows.map((row): FaceGalleryEnrollment => ({
          id: row.id,
          workspaceId: row.workspace_id,
          clientId: row.client_id,
          enrollmentStatus: row.enrollment_status,
          createdAt: row.created_at,
        }));

        const matchRows = normalizeRows<MatchRow>(payload.matches);
        const matches = matchRows.map((row): FaceGalleryMatch => ({
          matchId: row.match_id,
          enrollmentId: row.enrollment_id,
          assetId: row.asset_id,
          similarityScore: row.similarity_score === null ? null : toNumber(row.similarity_score),
          matchThreshold: row.match_threshold === null ? null : toNumber(row.match_threshold),
          isMatch: row.is_match,
          matchStatus: row.match_status,
          matchedAt: row.matched_at,
        }));

        const deliveryRows = normalizeRows<DeliveryRow>(payload.deliveries);
        const deliveries = deliveryRows.map((row): FaceGalleryDelivery => ({
          deliveryId: row.delivery_id,
          workspaceId: row.workspace_id,
          enrollmentId: row.enrollment_id,
          resultId: row.result_id,
          assetId: row.asset_id,
          deliveryStatus: row.delivery_status,
          deliveredAt: row.delivered_at,
          revokedAt: row.revoked_at,
          revokedReason: row.revoked_reason,
          createdAt: row.created_at,
        }));

        const lifecycleRows = normalizeRows<LifecycleSummaryRow>(payload.lifecycleSummaries);
        const lifecycleSummaries = lifecycleRows.map((row): FaceGalleryLifecycleSummary => ({
          enrollmentId: row.enrollment_id,
          workspaceId: row.workspace_id,
          totalLifecycleEvents: toNumber(row.total_lifecycle_events),
          createdEvents: toNumber(row.created_events),
          deliveredEvents: toNumber(row.delivered_events),
          revokedEvents: toNumber(row.revoked_events),
          restoredEvents: toNumber(row.restored_events),
          accessedEvents: toNumber(row.accessed_events),
          latestLifecycleEventAt: row.latest_lifecycle_event_at,
        }));

        const lifecycleEvents = lifecycleSummaries.reduce((total, summary) => total + summary.totalLifecycleEvents, 0);
        const matchedResults = matches.filter((match) => match.isMatch).length;

        return {
          workspaceId,
          enrollments,
          matches,
          deliveries,
          lifecycleSummaries,
          metrics: {
            enrollments: enrollments.length,
            matchedResults,
            deliveries: deliveries.length,
            lifecycleEvents,
          },
        };
      }
    }
  } catch (edgeErr) {
    console.warn("[getFaceGalleryDashboardData] Edge function notice, using clean default:", edgeErr);
  }

  // 2. Return clean empty state (no error page)
  return emptyState;
}