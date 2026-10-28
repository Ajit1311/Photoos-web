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
      return (dbEvents as Record<string, unknown>[]).map(mapApiEvent);
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
      return mapApiEvent(data.data as Record<string, unknown>);
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
      return mapApiEvent(dbEvent as Record<string, unknown>);
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
      return mapApiEvent(data.data as Record<string, unknown>);
    }
  } catch (edgeErr) {
    console.warn("[createEvent] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB insert fallback
  try {
    // 2.1 Calculate next event number for project
    let nextEventNumber = 1;
    try {
      const { data: existingEvents } = await supabase
        .from("events")
        .select("event_number")
        .eq("project_id", payload.projectId)
        .order("event_number", { ascending: false })
        .limit(1);

      if (existingEvents && existingEvents.length > 0 && typeof existingEvents[0].event_number === "number") {
        nextEventNumber = existingEvents[0].event_number + 1;
      }
    } catch {
      nextEventNumber = 1;
    }

    const eventCode = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Try scheduled status first, then draft if rejected
    const candidateStatuses = ["scheduled", "draft"] as const;
    let newEventRecord: Record<string, unknown> | null = null;
    let lastError: unknown = null;

    for (const status of candidateStatuses) {
      const insertPayload = {
        studio_id: studioId,
        project_id: payload.projectId,
        code: eventCode,
        event_number: nextEventNumber,
        name: payload.name,
        shoot_date: payload.shootDate,
        start_time: payload.startTime ?? null,
        end_time: payload.endTime ?? null,
        venue: payload.venue ?? null,
        location: payload.location ?? null,
        timezone: payload.timezone ?? "Asia/Kolkata",
        lead_photographer_id: payload.leadPhotographerId ?? null,
        notes: payload.notes ?? null,
        status,
        metadata: payload.metadata ?? {},
      };

      const { data: inserted, error: dbError } = await supabase
        .from("events")
        .insert(insertPayload)
        .select()
        .single();

      if (!dbError && inserted) {
        newEventRecord = inserted as Record<string, unknown>;
        break;
      }
      lastError = dbError;
    }

    if (newEventRecord) {
      return mapApiEvent(newEventRecord);
    }

    if (lastError) {
      console.error("[createEvent] Direct DB insert failed:", lastError);
    }
  } catch (dbErr) {
    console.error("[createEvent] DB fallback exception:", dbErr);
  }

  throw new Error("Failed to create event.");
}


// ============================================================================
// MAPPER
// ============================================================================

function mapApiEvent(
  event: Record<string, unknown>,
): Event {
  return {
    id: (event.id as string) ?? "",
    projectId: ((event.project_id ?? event.projectId) as string) ?? "",
    studioId: ((event.studio_id ?? event.studioId) as string) ?? "",
    workspaceId: ((event.workspace_id ?? event.workspaceId ?? event.studio_id ?? event.studioId) as string) ?? "",
    eventNumber: Number(event.event_number ?? event.eventNumber ?? 1),
    name: (event.name as string) ?? "",
    shootDate: ((event.shoot_date ?? event.shootDate) as string) ?? "",
    startTime: ((event.start_time ?? event.startTime ?? null) as string | null),
    endTime: ((event.end_time ?? event.endTime ?? null) as string | null),
    venue: ((event.venue as string | null) ?? null),
    location: ((event.location as string | null) ?? null),
    timezone: ((event.timezone as string) ?? "UTC"),
    status: ((event.status as Event["status"]) ?? "scheduled"),
    priority: (event.priority as Event["priority"] | undefined) ?? undefined,
    leadPhotographerId: ((event.lead_photographer_id ?? event.leadPhotographerId ?? null) as string | null),
    notes: ((event.notes as string | null) ?? null),
    metadata: ((event.metadata as Record<string, unknown>) ?? {}),
    createdAt: ((event.created_at ?? event.createdAt ?? new Date().toISOString()) as string),
    updatedAt: ((event.updated_at ?? event.updatedAt ?? new Date().toISOString()) as string),
    completedAt: ((event.completed_at ?? event.completedAt ?? null) as string | null),
    cancelledAt: ((event.cancelled_at ?? event.cancelledAt ?? null) as string | null),
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
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      "event-update",
      {
        method: "POST",
        headers,
        body: {
          event_id: eventId,
          name: payload.name ?? null,
          shoot_date: payload.shootDate ?? null,
          start_time: payload.startTime ?? null,
          end_time: payload.endTime ?? null,
          venue: payload.venue ?? null,
          location: payload.location ?? null,
          timezone: payload.timezone ?? null,
          status: payload.status ?? null,
          lead_photographer_id: payload.leadPhotographerId ?? null,
          notes: payload.notes ?? null,
          metadata: payload.metadata ?? null,
        },
      },
    );

    if (!error && data?.success === true && data?.data) {
      return mapApiEvent(data.data as Record<string, unknown>);
    }
  } catch (edgeErr) {
    console.warn("[updateEvent] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB update fallback
  try {
    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.name !== undefined) updateFields.name = payload.name;
    if (payload.shootDate !== undefined) updateFields.shoot_date = payload.shootDate;
    if (payload.startTime !== undefined) updateFields.start_time = payload.startTime;
    if (payload.endTime !== undefined) updateFields.end_time = payload.endTime;
    if (payload.venue !== undefined) updateFields.venue = payload.venue;
    if (payload.location !== undefined) updateFields.location = payload.location;
    if (payload.timezone !== undefined) updateFields.timezone = payload.timezone;
    if (payload.status !== undefined) updateFields.status = payload.status;
    if (payload.leadPhotographerId !== undefined) updateFields.lead_photographer_id = payload.leadPhotographerId;
    if (payload.notes !== undefined) updateFields.notes = payload.notes;
    if (payload.metadata !== undefined) updateFields.metadata = payload.metadata;

    const { data: updated, error: dbError } = await supabase
      .from("events")
      .update(updateFields)
      .eq("id", eventId)
      .eq("studio_id", studioId)
      .select()
      .single();

    if (!dbError && updated) {
      return mapApiEvent(updated as Record<string, unknown>);
    }
  } catch (dbErr) {
    console.error("[updateEvent] DB fallback exception:", dbErr);
  }

  throw new Error("Failed to update event.");
}


// ============================================================================
// GET EVENT WORKSPACE
// ============================================================================

export async function getEventWorkspace(
  studioId: string,
  eventId: string,
): Promise<EventWorkspaceResponse> {
  // 1. Try edge function first
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      WORKSPACE_FUNCTION_NAME,
      {
        method: "POST",
        headers,
        body: {
          event_id: eventId,
        },
      },
    );

    if (!error && data?.success === true && data?.data) {
      const workspaceData = data.data as EventWorkspaceData;
      const resolvedWorkspaceId =
        workspaceData.workspace_id ??
        workspaceData.workspaceId ??
        workspaceData.studio_id ??
        workspaceData.studioId ??
        (workspaceData.event?.studio_id as string | undefined) ??
        studioId;

      return {
        workspace: {
          workspace_id: resolvedWorkspaceId,
          workspaceId: resolvedWorkspaceId,
          studio_id: workspaceData.studio_id ?? resolvedWorkspaceId,
          studioId: workspaceData.studioId ?? resolvedWorkspaceId,
          event: mapApiEvent(workspaceData.event as Record<string, unknown>),
          project: workspaceData.project ?? null,
          client: workspaceData.client ?? null,
          lead_photographer: workspaceData.lead_photographer ?? null,
          finance: workspaceData.finance ?? null,
        },
        dashboard: {},
        timeline: [],
        summary: null,
      };
    }
  } catch (edgeErr) {
    console.warn("[getEventWorkspace] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: eventRow, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (!eventErr && eventRow) {
      const eventObj = mapApiEvent(eventRow as Record<string, unknown>);

      // Fetch project & client
      let projectData: Record<string, unknown> | null = null;
      let clientData: Record<string, unknown> | null = null;

      if (eventRow.project_id) {
        const { data: proj } = await supabase
          .from("projects")
          .select("*")
          .eq("id", eventRow.project_id)
          .maybeSingle();

        if (proj) {
          projectData = proj as Record<string, unknown>;

          if (proj.client_id) {
            const { data: cli } = await supabase
              .from("clients")
              .select("*")
              .eq("id", proj.client_id)
              .maybeSingle();
            if (cli) {
              clientData = cli as Record<string, unknown>;
            }
          }
        }
      }

      return {
        workspace: {
          workspace_id: studioId,
          workspaceId: studioId,
          studio_id: studioId,
          studioId: studioId,
          event: eventObj,
          project: projectData,
          client: clientData,
          lead_photographer: null,
          finance: ((eventRow.metadata as Record<string, unknown>)?.finance as EventWorkspaceFinance) ?? null,
        },
        dashboard: {},
        timeline: [],
        summary: null,
      };
    }
  } catch (dbErr) {
    console.error("[getEventWorkspace] DB fallback exception:", dbErr);
  }

  throw new Error("Failed to load event workspace.");
}