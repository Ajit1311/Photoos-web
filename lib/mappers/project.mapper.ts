import { Event } from "@/types/event";
import { ProjectDto } from "@/types/api/project";

export function mapProjectToEvent(
  project: ProjectDto,
): Event {
  return {
    id: project.id,

    projectId: project.id,

    title: project.title,

    status: project.status as Event["status"],

    date: project.event_date ?? "",

    venue: "",

    client: {
      id: project.client_id,

      name: "",

      phone: "",

      email: "",
    },

    gallery: {
      totalPhotos: 0,
      publishedPhotos: 0,
      favorites: 0,
      downloads: 0,
    },

    delivery: {
      published: false,
      visibility: "private",
      allowDownloads: false,
      watermark: true,
      expiresAt: "",
    },

    financial: {
      budget: project.budget,
      received: project.advance_amount,
      balance: project.balance_amount,
    },
  };
}