import {
  getAccessToken,
} from "@/lib/auth/session";

import {
  supabase,
} from "@/lib/supabase/client";

import type {
  EventCreateInput,
  Event,
  EventUpdateInput,
} from "@/types/api/event";


const FUNCTION_NAME =
  "events";


const CREATE_FUNCTION_NAME =
  "event-create-worker";


const WORKSPACE_FUNCTION_NAME =
  "event-workspace";


// ============================================================================
// HEADERS
// ============================================================================

async function getHeaders(
  studioId: string,
): Promise<
  Record<string, string>
> {

  const accessToken =
    await getAccessToken();


  if (!accessToken) {

    throw new Error(
      "User is not authenticated.",
    );

  }


  return {

    Authorization:
      `Bearer ${accessToken}`,

    "x-studio-id":
      studioId,

  };

}


// ============================================================================
// GET EVENTS
// ============================================================================

export async function getEvents(
  studioId: string,
  projectId?: string | null,
): Promise<Event[]> {
  // 1. Try Edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      "event-list",
      {
        method: "POST",
        headers,
        body: {
          project_id: projectId || null,
        },
      },
    );

    if (!error && data?.success === true && Array.isArray(data.data)) {
      return data.data as Event[];
    }
  } catch (edgeErr) {
    console.warn("[getEvents] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("events")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: dbEvents, error: dbError } = await query;
    if (!dbError && dbEvents) {
      return dbEvents as Event[];
    }
  } catch (dbErr) {
    console.warn("[getEvents] DB fallback error:", dbErr);
  }

  // 3. Resilient empty fallback
  return [];
}


// ============================================================================
// GET SINGLE EVENT
// ============================================================================

export async function getEvent(
  studioId: string,
  eventId: string,
): Promise<Event> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      `${FUNCTION_NAME}/${eventId}`,
      {
        method: "GET",
        headers,
      },
    );

    if (!error && data?.success === true && data?.data) {
      return data.data as Event;
    }
  } catch (edgeErr) {
    console.warn("[getEvent] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbEvent, error: dbError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (!dbError && dbEvent) {
      return dbEvent as Event;
    }
  } catch (dbErr) {
    console.warn("[getEvent] DB fallback error:", dbErr);
  }

  throw new Error("Event not found.");
}


// ============================================================================
// CREATE EVENT
// ============================================================================

export async function createEvent(
  studioId: string,
  payload: EventCreateInput,
): Promise<Event> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      CREATE_FUNCTION_NAME,
      {
        method: "POST",
        headers,
        body: {
          project_id: payload.projectId,
          name: payload.name,
          shoot_date: payload.shootDate,
          start_time: payload.startTime ?? null,
          end_time: payload.endTime ?? null,
          venue: payload.venue ?? null,
          location: payload.location ?? null,
          timezone: payload.timezone,
          lead_photographer_id: payload.leadPhotographerId ?? null,
          notes: payload.notes ?? null,
          metadata: payload.metadata ?? {},
        },
      },
    );

    if (!error && data?.success === true && data?.data) {
      return data.data as Event;
    }
  } catch (edgeErr) {
    console.warn("[createEvent] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB insert fallback
  try {
    const { data: newEvent, error: dbError } = await supabase
      .from("events")
      .insert({
        studio_id: studioId,
        project_id: payload.projectId,
        name: payload.name,
        shoot_date: payload.shootDate,
        start_time: payload.startTime ?? null,
        end_time: payload.endTime ?? null,
        venue: payload.venue ?? null,
        location: payload.location ?? null,
        timezone: payload.timezone ?? "UTC",
        lead_photographer_id: payload.leadPhotographerId ?? null,
        notes: payload.notes ?? null,
        status: "scheduled",
        metadata: payload.metadata ?? {},
      })
      .select()
      .single();

    if (!dbError && newEvent) {
      return newEvent as Event;
    }
  } catch (dbErr) {
    console.warn("[createEvent] DB fallback error:", dbErr);
  }

  throw new Error("Failed to create event.");
}


// ============================================================================
// MAPPER
// ============================================================================

function mapApiEvent(
  event:
    Record<
      string,
      unknown
    >,
): Event {

  return {

    id:
      event.id as string,

    projectId:
      event.project_id as string,

    studioId:
      event.studio_id as string,

    workspaceId:
      (
        event.workspace_id ??
        event.workspaceId ??
        event.studio_id
      ) as string,

    eventNumber:
      Number(
        event.event_number ??
        0,
      ),

    name:
      event.name as string,

    shootDate:
      event.shoot_date as string,

    startTime:
      (
        event.start_time as
          | string
          | null
      ) ??
      null,

    endTime:
      (
        event.end_time as
          | string
          | null
      ) ??
      null,

    venue:
      (
        event.venue as
          | string
          | null
      ) ??
      null,

    location:
      (
        event.location as
          | string
          | null
      ) ??
      null,

    timezone:
      event.timezone as string,

    status:
      event.status as Event["status"],

    priority:
      (
        event.priority as
          | Event["priority"]
          | undefined
      ) ??
      undefined,

    leadPhotographerId:
      (
        event.lead_photographer_id as
          | string
          | null
      ) ??
      null,

    notes:
      (
        event.notes as
          | string
          | null
      ) ??
      null,

    metadata:
      (
        event.metadata as
          | Record<
              string,
              unknown
            >
          | undefined
      ) ??
      {},

    createdAt:
      event.created_at as string,

    updatedAt:
      event.updated_at as string,

    completedAt:
      (
        event.completed_at as
          | string
          | null
      ) ??
      null,

    cancelledAt:
      (
        event.cancelled_at as
          | string
          | null
      ) ??
      null,

  };

}


// ============================================================================
// EVENT WORKSPACE TYPES
// ============================================================================

export type EventWorkspaceFinance = {

  package_amount:
    | number
    | string
    | null;

  advance_amount:
    | number
    | string
    | null;

  discount:
    | number
    | string
    | null;

  balance_amount:
    | number
    | string
    | null;

  payment_status:
    | string
    | null;

  payment_due_date:
    | string
    | null;

};


export type EventWorkspaceData = {

  workspace_id:
    string
    | null;

  workspaceId:
    string
    | null;

  studio_id:
    string
    | null;

  studioId:
    string
    | null;

  event:
    Record<
      string,
      unknown
    >;

  project:
    Record<
      string,
      unknown
    >
    | null;

  client:
    Record<
      string,
      unknown
    >
    | null;

  lead_photographer:
    Record<
      string,
      unknown
    >
    | null;

  finance:
    EventWorkspaceFinance
    | null;

};


export type EventWorkspaceResponse = {

  workspace: {

    workspace_id:
      string
      | null;

    workspaceId:
      string
      | null;

    studio_id:
      string
      | null;

    studioId:
      string
      | null;

    event:
      Event;

    project:
      Record<
        string,
        unknown
      >
      | null;

    client:
      Record<
        string,
        unknown
      >
      | null;

    lead_photographer:
      Record<
        string,
        unknown
      >
      | null;

    finance:
      EventWorkspaceFinance
      | null;

  };

  dashboard:
    Record<
      string,
      unknown
    >;

  timeline:
    Record<
      string,
      unknown
    >[];

  summary:
    Record<
      string,
      unknown
    >
    | null;

};


// ============================================================================
// UPDATE EVENT
// ============================================================================

export async function updateEvent(
  studioId: string,
  eventId: string,
  payload: EventUpdateInput,
): Promise<Event> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "event-update",
      {

        method:
          "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: {

          event_id:
            eventId,

          name:
            payload.name ??
            null,

          shoot_date:
            payload.shootDate ??
            null,

          start_time:
            payload.startTime ??
            null,

          end_time:
            payload.endTime ??
            null,

          venue:
            payload.venue ??
            null,

          location:
            payload.location ??
            null,

          timezone:
            payload.timezone ??
            null,

          status:
            payload.status ??
            null,

          lead_photographer_id:
            payload.leadPhotographerId ??
            null,

          notes:
            payload.notes ??
            null,

          metadata:
            payload.metadata ??
            null,

        },

      },
    );


  if (error) {

    throw error;

  }


  if (!data) {

    throw new Error(
      "Event update returned an empty response.",
    );

  }


  if (
    data.success !==
    true
  ) {

    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to update event.",
    );

  }


  if (!data.data) {

    throw new Error(
      "Event update succeeded but event data is missing.",
    );

  }


  return data.data as Event;

}


// ============================================================================
// GET EVENT WORKSPACE
// ============================================================================

export async function getEventWorkspace(
  studioId: string,
  eventId: string,
): Promise<
  EventWorkspaceResponse
> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      WORKSPACE_FUNCTION_NAME,
      {

        method:
          "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body: {

          event_id:
            eventId,

        },

      },
    );


  if (error) {

    throw error;

  }


  if (!data) {

    throw new Error(
      "Event workspace returned an empty response.",
    );

  }


  if (
    data.success !==
    true
  ) {

    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to load event workspace.",
    );

  }


  if (!data.data) {

    throw new Error(
      "Event workspace data is missing.",
    );

  }


  const workspaceData =
    data.data as EventWorkspaceData;


  const resolvedWorkspaceId =

    workspaceData.workspace_id ??

    workspaceData.workspaceId ??

    workspaceData.studio_id ??

    workspaceData.studioId ??

    (
      workspaceData.event
        ?.studio_id as
        | string
        | undefined
    ) ??

    null;


  return {

    workspace: {

      workspace_id:
        resolvedWorkspaceId,

      workspaceId:
        resolvedWorkspaceId,

      studio_id:
        workspaceData.studio_id ??
        resolvedWorkspaceId,

      studioId:
        workspaceData.studioId ??
        resolvedWorkspaceId,

      event:
        mapApiEvent(
          workspaceData.event,
        ),

      project:
        workspaceData.project ??
        null,

      client:
        workspaceData.client ??
        null,

      lead_photographer:
        workspaceData.lead_photographer ??
        null,

      finance:
        workspaceData.finance ??
        null,

    },


    dashboard:
      {},


    timeline:
      [],


    summary:
      null,

  };

}