import type {
  EventWizardData,
} from "@/types/event-wizard";

import type {
  CreateProjectRequest,
} from "@/types/api/project";

export function mapWizardToCreateProjectRequest(
  data: EventWizardData,
): CreateProjectRequest {

  return {

    title:
      data.title.trim(),

    description: null,

    event_type:
      data.eventType,

    event_date:
      data.eventDate,

    client_id:
  data.selectedClientId ?? "",

    project_manager_id:
      data.projectManagerId,

    budget:
      data.packageAmount,

    advance_amount:
      data.advanceAmount,

    notes: null,

    metadata: {

      venue:
        data.venue,

      eventTime:
        data.eventTime,

      discount:
        data.discount,

      balanceAmount:
        data.balanceAmount,

      paymentStatus:
        data.paymentStatus,

      paymentDueDate:
        data.paymentDueDate,

      gallery: {

        watermark:
          data.watermark,

        allowDownload:
          data.allowDownload,

        expiryDate:
          data.expiryDate,

      },

      ai: {

        faceRecognition:
          data.faceRecognition,

        autoCulling:
          data.autoCulling,

        autoEnhancement:
          data.autoEnhancement,

      },

    },

  };

}