import type {
  NotificationItem,
} from "@/types/notification/notification";


export function resolveNotificationAction(
  notification: NotificationItem,
): string | null {

  if (
    notification.action_url
  ) {
    return notification.action_url;
  }


  const entityType =
    notification.entity_type;

  const entityId =
    notification.entity_id;

  const metadata =
    notification.metadata;


  const reminderId =
    typeof metadata?.reminderId === "string"
      ? metadata.reminderId
      : typeof metadata?.reminder_id === "string"
        ? metadata.reminder_id
        : null;


  const eventId =
    typeof metadata?.eventId === "string"
      ? metadata.eventId
      : typeof metadata?.event_id === "string"
        ? metadata.event_id
        : null;


  if (
    notification.notification_type ===
    "payment_reminder"
  ) {

    if (
      eventId
      &&
      reminderId
    ) {
      return (
        "/dashboard/events/"
        + encodeURIComponent(eventId)
        + "?reminderId="
        + encodeURIComponent(reminderId)
      );
    }


    if (eventId) {
      return (
        "/dashboard/events/"
        + encodeURIComponent(eventId)
      );
    }
  }


  if (!entityType) {
    return null;
  }


  switch (
    entityType
  ) {

    case "dashboard":

      return "/dashboard";


    case "chat":

      return "/dashboard/chat";


    case "event":

      return entityId
        ? `/dashboard/events/${entityId}`
        : "/dashboard/events";


    case "project":

      return entityId
        ? `/dashboard/projects/${entityId}`
        : "/dashboard/projects";


    case "client":

      return entityId
        ? `/dashboard/clients/${entityId}`
        : "/dashboard/clients";


    case "album":

      return entityId
        ? `/dashboard/albums/${entityId}`
        : "/dashboard/albums";


    case "marketplace_lead":

      return entityId
        ? `/dashboard/marketplace/leads/${entityId}`
        : "/dashboard/marketplace/leads";


    case "payment":

      return "/dashboard/payments";


    default:

      return null;
  }
}
