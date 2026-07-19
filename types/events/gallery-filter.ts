import type { WorkspaceTab } from "./workspace";

export interface GalleryFilters {
  search: string;

  sortBy:
    | "latest"
    | "oldest"
    | "rating"
    | "likes";

  activeTab: WorkspaceTab;

  photographerId?: string;

  albumId?: string;

  aiCategory?: string;
}