export const GALLERY_TABS = [
  "all",
  "client-selected",
  "favorites",
  "albums",
  "ai-categories",
  "rejected",
  "hidden",
] as const;

export type GalleryTab =
  (typeof GALLERY_TABS)[number];