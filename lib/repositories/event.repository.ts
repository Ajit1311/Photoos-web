import type { Event } from "@/types/event";

import {
  eventService,
  type EventListResult,
} from "@/lib/services/event.service";

import type {
  EventWizardData,
} from "@/types/event-wizard";

class EventRepository {

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<EventListResult> {
    return eventService.getAll(
      studioId,
      page,
      limit,
      search,
    );
  }

  async getById(
    studioId: string,
    eventId: string,
  ): Promise<Event> {
    return eventService.getById(
      studioId,
      eventId,
    );
  }

  async create(
  studioId: string,
  wizard: EventWizardData,
): Promise<Event> {

  return eventService.create(
    studioId,
    wizard,
  );

}

  async update(
    event: Event,
  ): Promise<Event> {
    return eventService.update(event);
  }

  async publish(
    eventId: string,
  ): Promise<Event> {
    return eventService.publish(eventId);
  }

  async archive(
    eventId: string,
  ): Promise<void> {
    return eventService.archive(eventId);
  }

  async delete(
    eventId: string,
  ): Promise<void> {
    return eventService.delete(eventId);
  }

}

export const eventRepository =
  new EventRepository();