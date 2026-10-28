import { supabase } from "@/lib/supabase/client";

export interface StudioStandee {
  id: string;
  studio_id: string;
  active_event_id: string | null;
  standee_name: string;
  created_at: string;
  updated_at: string;
  active_event?: {
    id: string;
    name: string;
    shoot_date: string;
    venue?: string | null;
    status: string;
  } | null;
}

export async function getStudioStandee(studioId: string): Promise<StudioStandee | null> {
  if (!studioId) return null;

  try {
    const { data, error } = await supabase
      .from("studio_standees")
      .select("*, active_event:active_event_id(id, name, shoot_date, venue, status)")
      .eq("studio_id", studioId)
      .maybeSingle();

    if (!error && data) {
      return data as StudioStandee;
    }

    // Auto-create initial standee record if not existing
    const { data: created, error: createErr } = await supabase
      .from("studio_standees")
      .upsert({ studio_id: studioId, standee_name: "Main Event Standee" }, { onConflict: "studio_id" })
      .select("*, active_event:active_event_id(id, name, shoot_date, venue, status)")
      .maybeSingle();

    if (!createErr && created) {
      return created as StudioStandee;
    }
  } catch (err) {
    console.error("[getStudioStandee] Error fetching standee:", err);
  }

  return null;
}

export async function linkEventToStandee(
  studioId: string,
  eventId: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!studioId) return { success: false, error: "Studio ID is required." };

  try {
    const { error } = await supabase
      .from("studio_standees")
      .upsert(
        {
          studio_id: studioId,
          active_event_id: eventId || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "studio_id" },
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to link event.",
    };
  }
}

