import type { Event } from "@/types/event";

import {
  eventRepository,
} from "@/lib/repositories/event.repository";

export class WorkspaceService {

  async loadWorkspace(
    studioId: string,
    eventId: string,
  ): Promise<Event> {

    if (!studioId) {
      throw new Error(
        "Studio ID is required.",
      );
    }

    if (!eventId) {
      throw new Error(
        "Event ID is required.",
      );
    }

    return eventRepository.getById(
      studioId,
      eventId,
    );

  }

}

export const workspaceService =
  new WorkspaceService();