export const WORKSPACE_TABS = [
  "overview",
  "gallery",
  "payments",
  "delivery",
  "chat",
  "reminder",
  "settings",
] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];