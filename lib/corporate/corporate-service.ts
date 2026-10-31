// lib/corporate/corporate-service.ts
// Enterprise Corporate Office service for PhotoOS
import { supabase } from "@/lib/supabase/client";

export type CorporateCompany = {
  id: string;
  name: string;
  work_email: string;
  contact_person?: string;
  phone?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  website?: string;
  logo_url?: string;
  theme_color?: string;
  compliance_accepted: boolean;
  compliance_accepted_at?: string;
  subscription: {
    plan_name: string;
    plan_code: string;
    status: "trialing" | "active" | "expired";
    trial_start: string;
    trial_end: string;
    days_remaining: number;
  };
  created_at: string;
  updated_at: string;
};

export type CorporateEvent = {
  id: string;
  company_id: string;
  name: string;
  event_type: "Annual Day" | "Townhall" | "Offsite / Retreat" | "Conference" | "Festive Celebration" | "Team Meet" | "Award Ceremony" | "Other";
  date: string;
  location: string;
  description?: string;
  cover_image_url?: string;
  photos_count: number;
  ai_faces_indexed: number;
  allow_downloads: boolean;
  status: "active" | "completed" | "draft";
  created_at: string;
};

const DEFAULT_COMPANY_ID = "corp_acme_enterprise";
const STORAGE_KEY_COMPANY = "photoos_corporate_company";
const STORAGE_KEY_EVENTS = "photoos_corporate_events";

// Calculate remaining days in 7-day trial
export function calculateTrialDays(startDateStr?: string): number {
  const start = startDateStr ? new Date(startDateStr).getTime() : Date.now();
  const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - start;
  const remainingMs = trialDurationMs - elapsed;
  const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function getDefaultCorporateCompany(): CorporateCompany {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return {
    id: DEFAULT_COMPANY_ID,
    name: "",
    work_email: "",
    contact_person: "",
    phone: "",
    industry: "",
    company_size: "",
    location: "",
    website: "",
    logo_url: "",
    theme_color: "#0A3F61",
    compliance_accepted: false,
    compliance_accepted_at: undefined,
    subscription: {
      plan_name: "Corporate Enterprise (7-Day Free Trial)",
      plan_code: "corp_enterprise_7d_trial",
      status: "trialing",
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      days_remaining: 7,
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export function getDefaultCorporateEvents(companyId: string): CorporateEvent[] {
  return [];
}

// Get corporate company data
export async function getCorporateCompany(): Promise<CorporateCompany> {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_COMPANY);
      if (stored) {
        const company = JSON.parse(stored) as CorporateCompany;
        // Purge old demo data if found
        if (company.name === "Enterprise Tech Solutions" || company.contact_person === "HR & People Team") {
          const fresh = getDefaultCorporateCompany();
          window.localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(fresh));
          return fresh;
        }
        company.subscription.days_remaining = calculateTrialDays(company.subscription.trial_start);
        return company;
      }
    } catch {
      // Local storage fallback
    }
  }

  const defaultComp = getDefaultCorporateCompany();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(defaultComp));
    } catch {
      // ignore
    }
  }
  return defaultComp;
}

// Save or update corporate company
export async function saveCorporateCompany(data: Partial<CorporateCompany>): Promise<CorporateCompany> {
  const current = await getCorporateCompany();
  const updated: CorporateCompany = {
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  // Also attempt Supabase upsert if profile exists
  try {
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) {
      await supabase.from("studios").upsert({
        id: updated.id,
        name: updated.name,
        contact_email: updated.work_email,
        contact_phone: updated.phone,
        address: updated.location,
        website: updated.website,
        logo_url: updated.logo_url,
      }).maybeSingle();
    }
  } catch {
    // Non-blocking
  }

  return updated;
}

// Get corporate events
export async function getCorporateEvents(companyId: string): Promise<CorporateEvent[]> {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY_EVENTS}_${companyId}`);
      if (stored) {
        const evs = JSON.parse(stored) as CorporateEvent[];
        // Filter out any legacy hardcoded demo events
        const realEvents = evs.filter((e) => !e.id.startsWith("ev_corp_annual_day") && !e.id.startsWith("ev_corp_townhall") && !e.id.startsWith("ev_corp_diwali"));
        return realEvents;
      }
    } catch {
      // fallback
    }
  }

  return [];
}

// Create new corporate event
export async function createCorporateEvent(
  companyId: string,
  input: {
    name: string;
    event_type: CorporateEvent["event_type"];
    date: string;
    location: string;
    description?: string;
    cover_image_url?: string;
  }
): Promise<CorporateEvent> {
  const events = await getCorporateEvents(companyId);
  const newEvent: CorporateEvent = {
    id: `ev_corp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    company_id: companyId,
    name: input.name.trim(),
    event_type: input.event_type,
    date: input.date || new Date().toISOString().slice(0, 10),
    location: input.location.trim(),
    description: input.description?.trim() || "",
    cover_image_url: input.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    photos_count: 0,
    ai_faces_indexed: 0,
    allow_downloads: true,
    status: "active",
    created_at: new Date().toISOString(),
  };

  const updatedEvents = [newEvent, ...events];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${companyId}`, JSON.stringify(updatedEvents));
      // Sync to cloud storage in background
      fetch("/api/corporate/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      }).catch((e) => console.warn("[corporate-service] Cloud event sync notice:", e));
    } catch {
      // ignore
    }
  }

  return newEvent;
}

// Get single corporate event
export async function getCorporateEvent(companyId: string, eventId: string): Promise<CorporateEvent | null> {
  const events = await getCorporateEvents(companyId);
  const found = events.find((e) => e.id === eventId);
  if (found) return found;

  // Try fetching from cloud storage
  try {
    const res = await fetch(`/api/corporate/events?eventId=${encodeURIComponent(eventId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.event) {
        return data.event as CorporateEvent;
      }
    }
  } catch {}

  return null;
}

// Update corporate event
export async function updateCorporateEvent(
  companyId: string,
  eventId: string,
  updates: Partial<CorporateEvent>
): Promise<CorporateEvent | null> {
  const events = await getCorporateEvents(companyId);
  const index = events.findIndex((e) => e.id === eventId);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${companyId}`, JSON.stringify(events));
    } catch {
      // ignore
    }
  }

  return events[index];
}

// Delete corporate event
export async function deleteCorporateEvent(companyId: string, eventId: string): Promise<boolean> {
  const events = await getCorporateEvents(companyId);
  const filtered = events.filter((e) => e.id !== eventId);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${companyId}`, JSON.stringify(filtered));
      window.localStorage.removeItem(`photoos_corporate_photos_${eventId}`);
    } catch {
      // ignore
    }
  }
  return true;
}

export type CorporatePhoto = {
  id: string;
  event_id: string;
  name: string;
  url: string;
  thumbnail_url: string;
  size_bytes: number;
  width?: number;
  height?: number;
  ai_faces_detected?: number;
  uploaded_at: string;
};

const STORAGE_KEY_PHOTOS_PREFIX = "photoos_corporate_photos_";

// Get corporate photos for an event
export async function getCorporatePhotos(eventId: string): Promise<CorporatePhoto[]> {
  // Try cloud storage API first so all devices see the photos
  try {
    const res = await fetch(`/api/corporate/photos?eventId=${encodeURIComponent(eventId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data?.photos) && data.photos.length > 0) {
        return data.photos as CorporatePhoto[];
      }
    }
  } catch (err) {
    console.warn("[corporate-service] Cloud photos fetch notice:", err);
  }

  // Fallback to local storage
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`);
      if (stored) {
        return JSON.parse(stored) as CorporatePhoto[];
      }
    } catch {
      // fallback
    }
  }
  return [];
}

// Save corporate photos for an event
export async function saveCorporatePhotos(
  companyId: string,
  eventId: string,
  newPhotos: CorporatePhoto[]
): Promise<CorporatePhoto[]> {
  const existing = await getCorporatePhotos(eventId);
  
  // Deduplicate by photo ID
  const map = new Map<string, CorporatePhoto>();
  for (const p of existing) {
    if (p.id) map.set(p.id, p);
  }
  for (const p of newPhotos) {
    if (p.id) map.set(p.id, p);
  }
  const combined = Array.from(map.values());

  if (typeof window !== "undefined") {
    try {
      // Prevent localStorage quota overflow
      const cleanToStore = combined.map((p) => {
        if (p.url && p.url.startsWith("data:") && p.url.length > 50000) {
          return {
            ...p,
            url: p.thumbnail_url && !p.thumbnail_url.startsWith("data:") ? p.thumbnail_url : p.url.slice(0, 50000),
          };
        }
        return p;
      });
      window.localStorage.setItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`, JSON.stringify(cleanToStore));
    } catch (e) {
      console.warn("[corporate-service] localStorage save notice:", e);
    }
  }

  // Update photos count on the event
  const totalFaces = combined.reduce((acc, p) => acc + (p.ai_faces_detected || 1), 0);
  await updateCorporateEvent(companyId, eventId, {
    photos_count: combined.length,
    ai_faces_indexed: totalFaces,
    cover_image_url: combined[0]?.url,
  });

  return combined;
}

// Delete corporate photo
export async function deleteCorporatePhoto(
  companyId: string,
  eventId: string,
  photoId: string
): Promise<boolean> {
  // Call cloud storage API to delete
  try {
    await fetch(`/api/corporate/photos?eventId=${encodeURIComponent(eventId)}&photoId=${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("[corporate-service] Cloud photo delete notice:", e);
  }

  const existing = await getCorporatePhotos(eventId);
  const remaining = existing.filter((p) => p.id !== photoId);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`, JSON.stringify(remaining));
    } catch {
      // ignore
    }
  }

  // Update photos count on the event
  const totalFaces = remaining.reduce((acc, p) => acc + (p.ai_faces_detected || 1), 0);
  await updateCorporateEvent(companyId, eventId, {
    photos_count: remaining.length,
    ai_faces_indexed: totalFaces,
    cover_image_url: remaining[0]?.url,
  });

  return true;
}


