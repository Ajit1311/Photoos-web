import type { Event } from "@/types/event";
import { mockEvent, mockEvents } from "@/lib/mock/event";
import {
  getProject,
  getProjects,
  createProject,
} from "@/lib/api/projects";
import { mapProjectToEvent } from "@/lib/mappers/project.mapper";
import { mapWizardToCreateProjectRequest } from "@/lib/mappers/create-project-request.mapper";
import type { PaginationDto } from "@/types/api/project";
import type { EventWizardData } from "@/types/event-wizard";

export type EventListResult = {
  events: Event[];
  pagination: PaginationDto;
};

class EventService {

  async getById(
    studioId: string,
    eventId: string,
  ): Promise<Event> {
    try {
      const project = await getProject(studioId, eventId);
      return mapProjectToEvent(project);
    } catch (error) {
      console.error(error);
      return mockEvent;
    }
  }

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<EventListResult> {
    try {
      const response = await getProjects(studioId, page, limit, search);
      return {
        events: response.projects.map(mapProjectToEvent),
        pagination: response.pagination,
      };
    } catch (error) {
      console.error(error);
      return {
        events: mockEvents,
        pagination: {
          page: 1,
          limit: 25,
          total: mockEvents.length,
          totalPages: 1,
        },
      };
    }
  }

  /**
   * Replaced: Creates an event from wizard data using studioId
   */
  async create(
    studioId: string,
    wizard: EventWizardData,
  ): Promise<Event> {
    const request = mapWizardToCreateProjectRequest(wizard);
    const project = await createProject(studioId, request);
    return mapProjectToEvent(project);
  }

  async createFromWizard(
    studioId: string,
    data: EventWizardData,
  ): Promise<Event> {
    // व्हॅलिडेशन लॉजिक (Validation Logic)
    if (!data.title.trim()) {
      throw new Error("Event title is required.");
    }

    if (!data.selectedClientId) {
  throw new Error(
    "Client is required.",
  );
}
    const request = mapWizardToCreateProjectRequest(data);
    const project = await createProject(studioId, request);
    return mapProjectToEvent(project);
  }

  async update(
    event: Event,
  ): Promise<Event> {
    return event;
  }

  async publish(
    _eventId: string,
  ): Promise<Event> {
    void _eventId;
    return {
      ...mockEvent,
      status: "published",
    };
  }

  async archive(
    _eventId: string,
  ): Promise<void> {
    void _eventId;
  }

  async delete(
    _eventId: string,
  ): Promise<void> {
    void _eventId;
  }

}

export const eventService = new EventService();