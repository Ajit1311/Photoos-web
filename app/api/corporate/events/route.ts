import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/corporate/events?eventId=... or ?companyId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const companyId = searchParams.get("companyId") || "corporate";

    const supabase = getServerSupabase();

    if (eventId) {
      const eventPath = `corporate/${eventId}/event.json`;
      const { data, error } = await supabase.storage.from("assets").download(eventPath);

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: "Event not found." },
          { status: 404, headers: corsHeaders }
        );
      }

      const text = await data.text();
      const event = JSON.parse(text);

      return NextResponse.json({ success: true, event }, { status: 200, headers: corsHeaders });
    }

    // List events for company
    const listPath = `corporate/companies/${companyId}/events.json`;
    const { data: listData } = await supabase.storage.from("assets").download(listPath);

    if (!listData) {
      return NextResponse.json({ success: true, events: [] }, { status: 200, headers: corsHeaders });
    }

    const text = await listData.text();
    const events = JSON.parse(text);

    return NextResponse.json(
      { success: true, events: Array.isArray(events) ? events : [] },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch events." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/corporate/events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, event_type, date, location, description, company_id, company_name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "Event ID and name are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getServerSupabase();
    const eventObj = {
      id,
      name,
      event_type: event_type || "Annual Day",
      date: date || new Date().toISOString().slice(0, 10),
      location: location || "Office Headquarters",
      description: description || "",
      company_id: company_id || "corporate",
      company_name: company_name || "Corporate Office",
      updated_at: new Date().toISOString(),
      created_at: body.created_at || new Date().toISOString(),
    };

    // Save single event manifest
    const eventBlob = new Blob([JSON.stringify(eventObj, null, 2)], { type: "application/json" });
    const eventBuffer = Buffer.from(await eventBlob.arrayBuffer());

    await supabase.storage
      .from("assets")
      .upload(`corporate/${id}/event.json`, eventBuffer, {
        contentType: "application/json",
        upsert: true,
      });

    // Update company event list
    const compId = company_id || "corporate";
    const listPath = `corporate/companies/${compId}/events.json`;
    let existingList: any[] = [];
    try {
      const { data: existingData } = await supabase.storage.from("assets").download(listPath);
      if (existingData) {
        existingList = JSON.parse(await existingData.text());
        if (!Array.isArray(existingList)) existingList = [];
      }
    } catch {}

    const filtered = existingList.filter((e) => e.id !== id);
    const updatedList = [eventObj, ...filtered];

    const listBlob = new Blob([JSON.stringify(updatedList, null, 2)], { type: "application/json" });
    const listBuffer = Buffer.from(await listBlob.arrayBuffer());

    await supabase.storage
      .from("assets")
      .upload(listPath, listBuffer, {
        contentType: "application/json",
        upsert: true,
      });

    return NextResponse.json(
      { success: true, event: eventObj },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save corporate event." },
      { status: 500, headers: corsHeaders }
    );
  }
}
