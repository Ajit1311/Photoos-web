import type { Event as ApiEvent } from "@/types/api/event";
import type { Event as UiEvent } from "@/types/event";

export function mapApiEventToEvent(
  event: ApiEvent,
): UiEvent {

  return {
    id:
      event.id,

    projectId:
      event.projectId,

    title:
      event.name,

    status:
      mapEventStatus(event.status),

    date:
      event.shootDate,

    venue:
      event.venue ?? "",

    client: {
      id:
        "",
      name:
        "",
      phone:
        "",
      email:
        "",
    },

    gallery: {
      totalPhotos:
        0,
      publishedPhotos:
        0,
      favorites:
        0,
      downloads:
        0,
    },

    delivery: {
      published:
        false,
      visibility:
        "private",
      allowDownloads:
        false,
      watermark:
        true,
      expiresAt:
        null,
    },

    financial: {
      budget:
        0,
      received:
        0,
      balance:
        0,
    },

  };

}


function mapEventStatus(
  status: ApiEvent["status"],
): UiEvent["status"] {

  switch (status) {

    case "draft":
      return "draft";

    case "scheduled":
      return "active";

    case "in_progress":
      return "active";

    case "completed":
      return "completed";

    case "cancelled":
      return "draft";

    default:
      return "draft";

  }

}
