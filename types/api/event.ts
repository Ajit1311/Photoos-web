/**
 * ============================================================
 * PhotoOS
 * Event API Types
 * ============================================================
 */

export type UUID = string;

export type ISODate = string;

export type ISODateTime = string;

/* ============================================================
 * Event Status
 * ============================================================
 */

export type EventStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

/* ============================================================
 * Event Priority
 * ============================================================
 */

export type EventPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

/* ============================================================
 * Event Sort
 * ============================================================
 */

export type EventSortField =
  | "shoot_date"
  | "created_at"
  | "updated_at"
  | "name";

export type SortDirection =
  | "asc"
  | "desc";

/* ============================================================
 * Pagination
 * ============================================================
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/* ============================================================
 * Event Filters
 * ============================================================
 */

export interface EventFilters {
  projectId?: UUID;

  studioId?: UUID;

  status?: EventStatus;

  leadPhotographerId?: UUID;

  search?: string;

  fromDate?: ISODate;

  toDate?: ISODate;

  page?: number;

  pageSize?: number;

  sortBy?: EventSortField;

  sortDirection?: SortDirection;
}

/* ============================================================
 * Base Event
 * ============================================================
 */

export interface Event {

  id: UUID;

  projectId: UUID;

  studioId: UUID;

  workspaceId: UUID;

  eventNumber: number;

  name: string;

  shootDate: ISODate;

  startTime: ISODateTime | null;

  endTime: ISODateTime | null;

  venue: string | null;

  location: string | null;

  timezone: string;

  status: EventStatus;

  priority?: EventPriority;

  leadPhotographerId: UUID | null;

  notes: string | null;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;

  updatedAt: ISODateTime;

  completedAt: ISODateTime | null;

  cancelledAt: ISODateTime | null;
}
/* ============================================================
 * Event Create
 * ============================================================
 */

export interface EventCreateInput {
  projectId: UUID;

  name: string;

  shootDate: ISODate;

  startTime?: ISODateTime | null;

  endTime?: ISODateTime | null;

  venue?: string | null;

  location?: string | null;

  timezone: string;

  leadPhotographerId?: UUID | null;

  notes?: string | null;

  metadata?: Record<string, unknown>;
}

/* ============================================================
 * Event Update
 * ============================================================
 */

export interface EventUpdateInput {
  name?: string;

  shootDate?: ISODate;

  startTime?: ISODateTime | null;

  endTime?: ISODateTime | null;

  venue?: string | null;

  location?: string | null;

  timezone?: string;

  status?: EventStatus;

  priority?: EventPriority;

  leadPhotographerId?: UUID | null;

  notes?: string | null;

  metadata?: Record<string, unknown>;
}

/* ============================================================
 * Event Summary
 * ============================================================
 */

export interface EventSummary {
  totalAssets: number;

  totalPhotos: number;

  totalVideos: number;

  totalAlbums: number;

  totalGalleryImages: number;

  totalFavorites: number;

  totalSelections: number;

  totalDownloads: number;

  galleryCount: number;

  deliveryCount: number;

  teamCount: number;

  completedTasks: number;

  pendingTasks: number;
}

/* ============================================================
 * Event Dashboard
 * ============================================================
 */

export interface EventDashboard {
  event: Event;

  summary: EventSummary;

  recentActivity: unknown[];

  upcomingTasks: unknown[];

  notifications: unknown[];
}

/* ============================================================
 * Timeline
 * ============================================================
 */

export interface EventTimelineItem {
  id: UUID;

  type: string;

  title: string;

  description: string | null;

  occurredAt: ISODateTime;

  createdBy: UUID | null;

  metadata: Record<string, unknown>;
}

export interface EventTimeline {
  eventId: UUID;

  items: EventTimelineItem[];
}

/* ============================================================
 * Event Workspace
 * ============================================================
 */

export interface EventWorkspace {
  event: Event;

  summary: EventSummary;

  dashboard: EventDashboard;

  timeline: EventTimeline;
}

/* ============================================================
 * Event List Response
 * ============================================================
 */

export interface EventListResponse
  extends PaginatedResponse<Event> {}

/* ============================================================
 * Lookup Option
 * ============================================================
 */

export interface EventOption {
  id: UUID;

  name: string;

  eventNumber: number;

  shootDate: ISODate;

  status: EventStatus;
}
/* ============================================================
 * Event Team
 * ============================================================
 */

export type EventTeamRole =
  | "lead_photographer"
  | "photographer"
  | "videographer"
  | "drone_operator"
  | "editor"
  | "assistant"
  | "coordinator"
  | "other";

export interface EventTeamMember {
  id: UUID;

  eventId: UUID;

  studioMemberId: UUID;

  profileId: UUID;

  fullName: string;

  email: string | null;

  avatarUrl: string | null;

  role: EventTeamRole;

  isLead: boolean;

  notes: string | null;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;

  updatedAt: ISODateTime;
}

/* ============================================================
 * Gallery
 * ============================================================
 */

export type GalleryStatus =
  | "draft"
  | "published"
  | "archived";

export type GalleryType =
  | "client"
  | "selection"
  | "proof"
  | "delivery"
  | "internal";

export interface EventGallery {
  id: UUID;

  eventId: UUID;

  name: string;

  slug: string;

  description: string | null;

  galleryType: GalleryType;

  status: GalleryStatus;

  coverAssetId: UUID | null;

  sortOrder: number;

  assetCount: number;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;

  updatedAt: ISODateTime;
}

/* ============================================================
 * Gallery Asset
 * ============================================================
 */

export interface EventGalleryAsset {
  id: UUID;

  galleryId: UUID;

  assetId: UUID;

  displayOrder: number;

  isFeatured: boolean;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;
}

/* ============================================================
 * Delivery
 * ============================================================
 */

export type DeliveryStatus =
  | "draft"
  | "published"
  | "expired"
  | "completed"
  | "archived";

export type DeliveryType =
  | "gallery"
  | "download"
  | "selection"
  | "proof";

export interface EventDelivery {
  id: UUID;

  galleryId: UUID;

  title: string;

  slug: string;

  description: string | null;

  deliveryType: DeliveryType;

  status: DeliveryStatus;

  coverAssetId: UUID | null;

  downloadEnabled: boolean;

  watermarkEnabled: boolean;

  allowFavorites: boolean;

  allowComments: boolean;

  allowSharing: boolean;

  allowHighResolution: boolean;

  allowOriginal: boolean;

  allowSelection: boolean;

  allowWatermarkedPreview: boolean;

  expiresAt: ISODateTime | null;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;

  updatedAt: ISODateTime;
}

/* ============================================================
 * Delivery Access
 * ============================================================
 */

export interface EventDeliveryAccess {
  id: UUID;

  deliveryId: UUID;

  accessType: string;

  email: string | null;

  phone: string | null;

  maxViews: number | null;

  expiresAt: ISODateTime | null;

  metadata: Record<string, unknown>;

  createdAt: ISODateTime;
}

/* ============================================================
 * Analytics
 * ============================================================
 */

export interface EventAnalytics {
  totalViews: number;

  totalDownloads: number;

  totalFavorites: number;

  totalSelections: number;

  totalComments: number;

  totalGalleryAssets: number;

  totalDeliveries: number;

  totalVisitors: number;
}

/* ============================================================
 * RPC Responses
 * ============================================================
 */

export interface RpcResponse<T> {
  data: T;

  success: boolean;

  message?: string;
}

export interface RpcListResponse<T> {
  data: T[];

  success: boolean;

  total: number;

  page?: number;

  pageSize?: number;
}

export interface RpcMutationResponse {
  success: boolean;

  id?: UUID;

  message?: string;
}
