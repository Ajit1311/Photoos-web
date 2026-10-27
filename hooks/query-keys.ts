export const QUERY_KEYS = {

  bootstrap:
    ["bootstrap"] as const,

  dashboard:
    ["dashboard-summary"] as const,

  subscriptionUsage:
    ["subscription-usage"] as const,

  clients:
    ["clients"] as const,

  client: (
    studioId: string,
    clientId: string,
  ) => [
    "client",
    studioId,
    clientId,
  ] as const,

  projects:
    ["projects"] as const,

  project: (
    studioId: string,
    projectId: string,
  ) => [
    "project",
    studioId,
    projectId,
  ] as const,

  events:
    ["events"] as const,

  event: (
    studioId: string,
    eventId: string,
  ) => [
    "event",
    studioId,
    eventId,
  ] as const,

  teamMembers:
    ["team-members"] as const,

  auth:
    ["auth"] as const,

};