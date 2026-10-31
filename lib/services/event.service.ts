import type {
  Event,
} from "@/types/event";

import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
} from "@/lib/api/events";

import type {
  EventCreateInput,
  EventUpdateInput,
} from "@/types/api/event";

import type {
  PaginationDto,
} from "@/types/api/project";

import type {
  EventWizardData,
} from "@/types/event-wizard";

import {
  mapApiEventToEvent,
} from "@/lib/mappers/event.mapper";


export type EventListResult = {
  events: Event[];

  pagination: PaginationDto;
};


class EventService {


  // ==========================================================================
  // GET SINGLE EVENT
  // ==========================================================================

  async getById(
    studioId: string,
    eventId: string,
  ): Promise<Event> {

    const apiEvent =
      await getEvent(
        studioId,
        eventId,
      );

    return mapApiEventToEvent(
      apiEvent,
    );

  }


  // ==========================================================================
  // GET EVENTS FOR PROJECT
  // ==========================================================================

  async getAll(
    studioId: string,
    projectId: string,
  ): Promise<EventListResult> {

    if (!projectId) {

      throw new Error(
        "Project ID is required.",
      );

    }


    const apiEvents =
      await getEvents(
        studioId,
        projectId,
      );


    const events =
      apiEvents.map(
        mapApiEventToEvent,
      );


    return {

      events,

      pagination: {

        page:
          1,

        limit:
          events.length || 25,

        total:
          events.length,

        totalPages:
          events.length > 0
            ? 1
            : 0,

      },

    };

  }


  // ==========================================================================
  // CREATE EVENT
  //
  // IMPORTANT:
  // Creates an event under the EXISTING project.
  //
  // It does NOT create a new project.
  // ==========================================================================

  async create(
    studioId: string,
    wizard: EventWizardData,
  ): Promise<Event> {

    const payload =
      this.mapWizardToCreateEvent(
        wizard,
      );


    const apiEvent =
      await createEvent(
        studioId,
        payload,
      );


    return mapApiEventToEvent(
      apiEvent,
    );

  }


  // ==========================================================================
  // CREATE EVENT FROM WIZARD
  // ==========================================================================

  async createFromWizard(
    studioId: string,
    data: EventWizardData,
  ): Promise<Event> {

    // ------------------------------------------------------------------------
    // Event title validation
    // ------------------------------------------------------------------------

    if (
      !data.title ||
      !data.title.trim()
    ) {

      throw new Error(
        "Event title is required.",
      );

    }


    // ------------------------------------------------------------------------
    // Client validation
    // ------------------------------------------------------------------------

    if (
      !data.selectedClientId
    ) {

      throw new Error(
        "Client is required.",
      );

    }


    // ------------------------------------------------------------------------
    // Event date validation
    // ------------------------------------------------------------------------

    if (
      !data.eventDate ||
      !data.eventDate.trim()
    ) {

      throw new Error(
        "Event date is required.",
      );

    }


    // ------------------------------------------------------------------------
    // Build backend payload
    // ------------------------------------------------------------------------

    const payload =
      this.mapWizardToCreateEvent(
        data,
      );


    // ------------------------------------------------------------------------
    // Create actual event
    // ------------------------------------------------------------------------

    const apiEvent =
      await createEvent(
        studioId,
        payload,
      );


    return mapApiEventToEvent(
      apiEvent,
    );

  }


  // ==========================================================================
  // WIZARD → EVENT CREATE REQUEST
  // ==========================================================================

  private mapWizardToCreateEvent(
    data: EventWizardData,
  ): EventCreateInput {

    // ------------------------------------------------------------------------
    // Required event title
    // ------------------------------------------------------------------------

    if (
      !data.title ||
      !data.title.trim()
    ) {

      throw new Error(
        "Event title is required.",
      );

    }


    // ------------------------------------------------------------------------
    // Required event date
    // ------------------------------------------------------------------------

    if (
      !data.eventDate ||
      !data.eventDate.trim()
    ) {

      throw new Error(
        "Event date is required.",
      );

    }


    // ------------------------------------------------------------------------
    // Build metadata
    //
    // Wizard contains fields which the current create_event RPC
    // does not have as dedicated columns.
    //
    // Keep them inside metadata rather than losing the information.
    // ------------------------------------------------------------------------

    const metadata:
      Record<string, unknown> = {

      event_type:
        data.eventType,

      client_id:
        data.selectedClientId,

      client_mode:
        data.clientMode,

      client_name:
        data.clientName,

      client_phone:
        data.clientPhone,

      client_email:
        data.clientEmail,

      client_address:
        data.clientAddress,

      project_manager_id:
        data.projectManagerId,

      photographer_ids:
        data.photographerIds,

      editor_ids:
        data.editorIds,

      package_amount:
        data.packageAmount,

      advance_amount:
        data.advanceAmount,

      discount:
        data.discount,

      balance_amount:
        data.balanceAmount,

      payment_due_date:
        data.paymentDueDate,

      payment_status:
        data.paymentStatus,

      generate_qr_gallery:
        data.generateQrGallery,

      enable_client_gallery:
        data.enableClientGallery,

      allow_download:
        data.allowDownload,

      lock_downloads_until_payment:
        data.lockDownloadsUntilPayment,

      watermark:
        data.watermark,

      enable_favourite_selection:
        data.enableFavouriteSelection,

      expiry_date:
        data.expiryDate,

      face_recognition:
        data.faceRecognition,

      duplicate_detection:
        data.duplicateDetection,

      blur_detection:
        data.blurDetection,

      best_photo_selection:
        data.bestPhotoSelection,

      album_suggestions:
        data.albumSuggestions,

      smart_tag_generation:
        data.smartTagGeneration,

    };


    // ------------------------------------------------------------------------
    // Backend EventCreateInput
    // ------------------------------------------------------------------------

    return {

      projectId:
        data.projectId,

      name:
        data.title.trim(),

      shootDate:
        data.eventDate,

      startTime:
        data.eventTime
          ? `${data.eventDate}T${data.eventTime}:00+05:30`
          : null,

      endTime:
        null,

      venue:
        data.venue?.trim() || null,

      location:
        null,

      timezone:
        "Asia/Kolkata",

      leadPhotographerId:
        data.photographerIds.length > 0
          ? data.photographerIds[0]
          : null,

      notes:
        null,

      metadata,

    };

  }


  // ==========================================================================
  // UPDATE EVENT
  // ==========================================================================

  async update(
  studioId: string,
  event: Event,
  status: string,
): Promise<Event> {

  const apiEvent =
    await updateEvent(
      studioId,
      event.id,
      {
        status:
          status as EventUpdateInput["status"],
      },
    );

  return mapApiEventToEvent(
    apiEvent,
  );
}


  // ==========================================================================
  // PUBLISH EVENT
  // ==========================================================================

  async publish(
    eventId: string,
  ): Promise<Event> {

    throw new Error(
      `Event publish is not implemented yet: ${eventId}`,
    );

  }


  // ==========================================================================
  // ARCHIVE EVENT
  // ==========================================================================

  async archive(
    eventId: string,
  ): Promise<void> {

    throw new Error(
      `Event archive is not implemented yet: ${eventId}`,
    );

  }


  // ==========================================================================
  // DELETE EVENT
  // ==========================================================================

  async delete(
    eventId: string,
  ): Promise<void> {

    throw new Error(
      `Event delete is not implemented yet: ${eventId}`,
    );

  }

}


export const eventService =
  new EventService();
