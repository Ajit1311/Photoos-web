import {
  eventService,
} from "@/lib/services/event.service";

import type {
  Event,
} from "@/types/event";

import type {
  EventWizardData,
} from "@/types/event-wizard";

export type EventRepositoryListResult =
  Awaited<
    ReturnType<
      typeof eventService.getAll
    >
  >;


class EventRepository {


  // ==========================================================================
  // GET EVENTS FOR PROJECT
  // ==========================================================================

  async getAll(
    studioId: string,
    projectId: string,
  ): Promise<EventRepositoryListResult> {

    return eventService.getAll(
      studioId,
      projectId,
    );

  }


  // ==========================================================================
  // GET SINGLE EVENT
  // ==========================================================================

  async getById(
    studioId: string,
    eventId: string,
  ): Promise<Event> {

    return eventService.getById(
      studioId,
      eventId,
    );

  }


  // ==========================================================================
  // CREATE EVENT
  // ==========================================================================

  async create(
    studioId: string,
    wizard: EventWizardData,
  ): Promise<Event> {

    return eventService.create(
      studioId,
      wizard,
    );

  }


  // ==========================================================================
  // CREATE EVENT FROM WIZARD
  // ==========================================================================

  async createFromWizard(
    studioId: string,
    data: EventWizardData,
  ): Promise<Event> {

    return eventService.createFromWizard(
      studioId,
      data,
    );

  }


  // ==========================================================================
  // UPDATE EVENT
  // ==========================================================================

  async update(
  studioId: string,
  event: Event,
  status: string,
): Promise<Event> {

  return eventService.update(
    studioId,
    event,
    status,
  );

}


  // ==========================================================================
  // PUBLISH EVENT
  // ==========================================================================

  async publish(
    eventId: string,
  ): Promise<Event> {

    return eventService.publish(
      eventId,
    );

  }


  // ==========================================================================
  // ARCHIVE EVENT
  // ==========================================================================

  async archive(
    eventId: string,
  ): Promise<void> {

    return eventService.archive(
      eventId,
    );

  }


  // ==========================================================================
  // DELETE EVENT
  // ==========================================================================

  async delete(
    eventId: string,
  ): Promise<void> {

    return eventService.delete(
      eventId,
    );

  }

}


export const eventRepository =
  new EventRepository();