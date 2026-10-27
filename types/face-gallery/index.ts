export type FaceGalleryEnrollmentStatus =
  | "active"
  | "inactive"
  | "pending"
  | "revoked"
  | string;

export type FaceGalleryDeliveryStatus =
  | "pending"
  | "delivered"
  | "revoked"
  | string;

export interface FaceGalleryEnrollment {
  id: string;

  workspaceId: string;

  clientId: string | null;

  enrollmentStatus:
    FaceGalleryEnrollmentStatus;

  createdAt: string;
}

export interface FaceGalleryMatch {
  matchId: string;

  enrollmentId: string;

  assetId: string | null;

  similarityScore: number | null;

  matchThreshold: number | null;

  isMatch: boolean;

  matchStatus: string;

  matchedAt: string | null;
}

export interface FaceGalleryDelivery {
  deliveryId: string;

  workspaceId: string;

  enrollmentId: string;

  resultId: string;

  assetId: string;

  deliveryStatus:
    FaceGalleryDeliveryStatus;

  deliveredAt: string | null;

  revokedAt: string | null;

  revokedReason: string | null;

  createdAt: string;
}

export interface FaceGalleryLifecycleSummary {
  enrollmentId: string;

  workspaceId: string;

  totalLifecycleEvents: number;

  createdEvents: number;

  deliveredEvents: number;

  revokedEvents: number;

  restoredEvents: number;

  accessedEvents: number;

  latestLifecycleEventAt: string | null;
}

export interface FaceGalleryDashboardData {
  workspaceId: string;

  enrollments:
    FaceGalleryEnrollment[];

  matches:
    FaceGalleryMatch[];

  deliveries:
    FaceGalleryDelivery[];

  lifecycleSummaries:
    FaceGalleryLifecycleSummary[];

  metrics: {
    enrollments: number;

    matchedResults: number;

    deliveries: number;

    lifecycleEvents: number;
  };
}
