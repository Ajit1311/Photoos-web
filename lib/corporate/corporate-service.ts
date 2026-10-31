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
  const eventMap = new Map<string, CorporateEvent>();

  if (typeof window !== "undefined") {
    try {
      // 1. Check company specific list
      const storedComp = window.localStorage.getItem(`${STORAGE_KEY_EVENTS}_${companyId}`);
      if (storedComp) {
        const evs = JSON.parse(storedComp) as CorporateEvent[];
        if (Array.isArray(evs)) {
          evs.forEach((e) => {
            if (e?.id && !e.id.startsWith("ev_corp_annual_day") && !e.id.startsWith("ev_corp_townhall") && !e.id.startsWith("ev_corp_diwali")) {
              eventMap.set(e.id, e);
            }
          });
        }
      }

      // 2. Check universal events list
      const storedUniversal = window.localStorage.getItem(STORAGE_KEY_EVENTS);
      if (storedUniversal) {
        const evs = JSON.parse(storedUniversal) as CorporateEvent[];
        if (Array.isArray(evs)) {
          evs.forEach((e) => {
            if (e?.id && !e.id.startsWith("ev_corp_annual_day") && !e.id.startsWith("ev_corp_townhall") && !e.id.startsWith("ev_corp_diwali")) {
              eventMap.set(e.id, e);
            }
          });
        }
      }

      // 3. Scan any other corporate events key in localStorage
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_EVENTS) && key !== STORAGE_KEY_EVENTS && key !== `${STORAGE_KEY_EVENTS}_${companyId}`) {
          try {
            const val = window.localStorage.getItem(key);
            if (val) {
              const list = JSON.parse(val) as CorporateEvent[];
              if (Array.isArray(list)) {
                list.forEach((e) => {
                  if (e?.id && !e.id.startsWith("ev_corp_annual_day")) eventMap.set(e.id, e);
                });
              }
            }
          } catch {}
        }
      }
    } catch {
      // fallback
    }
  }

  // 4. Try cloud API
  try {
    const res = await fetch(`/api/corporate/events?companyId=${encodeURIComponent(companyId || "corporate")}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data?.events)) {
        data.events.forEach((e: CorporateEvent) => {
          if (e?.id) {
            const local = eventMap.get(e.id);
            // Merge, keeping highest photos_count
            eventMap.set(e.id, {
              ...e,
              ...local,
              photos_count: Math.max(local?.photos_count || 0, e.photos_count || 0),
            });
          }
        });
      }
    }
  } catch {}

  const list = Array.from(eventMap.values());
  // Sort descending by created_at / date
  list.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  return list;
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
  const actualCompanyId = companyId || DEFAULT_COMPANY_ID;
  const events = await getCorporateEvents(actualCompanyId);
  const newEvent: CorporateEvent = {
    id: `ev_corp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    company_id: actualCompanyId,
    name: input.name.trim(),
    event_type: input.event_type,
    date: input.date || new Date().toISOString().slice(0, 10),
    location: input.location.trim(),
    description: input.description?.trim() || "",
    cover_image_url: input.cover_image_url || undefined,
    photos_count: 0,
    ai_faces_indexed: 0,
    allow_downloads: true,
    status: "active",
    created_at: new Date().toISOString(),
  };

  const updatedEvents = [newEvent, ...events];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${actualCompanyId}`, JSON.stringify(updatedEvents));
      window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
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
  let found = events.find((e) => e.id === eventId);
  if (found) return found;

  // Search universal list or any corporate key in localStorage
  if (typeof window !== "undefined") {
    try {
      const universal = window.localStorage.getItem(STORAGE_KEY_EVENTS);
      if (universal) {
        const uList = JSON.parse(universal) as CorporateEvent[];
        found = uList.find((e) => e.id === eventId);
        if (found) return found;
      }
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_EVENTS)) {
          const val = window.localStorage.getItem(key);
          if (val) {
            const list = JSON.parse(val) as CorporateEvent[];
            if (Array.isArray(list)) {
              found = list.find((e) => e.id === eventId);
              if (found) return found;
            }
          }
        }
      }
    } catch {}
  }

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
  const actualCompanyId = companyId || DEFAULT_COMPANY_ID;
  const events = await getCorporateEvents(actualCompanyId);
  const index = events.findIndex((e) => e.id === eventId);
  
  let targetEvent: CorporateEvent;
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    targetEvent = events[index];
  } else {
    // If not found in list, attempt to fetch and update
    const single = await getCorporateEvent(actualCompanyId, eventId);
    if (!single) return null;
    targetEvent = { ...single, ...updates };
    events.unshift(targetEvent);
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${actualCompanyId}`, JSON.stringify(events));
      window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      // Background sync to cloud
      fetch("/api/corporate/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetEvent),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  return targetEvent;
}

// Delete corporate event
export async function deleteCorporateEvent(companyId: string, eventId: string): Promise<boolean> {
  const events = await getCorporateEvents(companyId);
  const filtered = events.filter((e) => e.id !== eventId);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${companyId}`, JSON.stringify(filtered));
      window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(filtered));
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
  storage_path?: string;
  size_bytes: number;
  width?: number;
  height?: number;
  ai_faces_detected?: number;
  uploaded_at: string;
};

const STORAGE_KEY_PHOTOS_PREFIX = "photoos_corporate_photos_";

// Get corporate photos for an event (LOCAL-FIRST + MERGE TO PREVENT ANY WIPEOUT)
export async function getCorporatePhotos(eventId: string): Promise<CorporatePhoto[]> {
  if (!eventId) return [];

  // 1. Immediately read local storage so user sees existing photos without delay or wipeout
  let localPhotos: CorporatePhoto[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localPhotos = parsed;
        }
      }
    } catch (e) {
      console.warn("[corporate-service] Local storage photos read notice:", e);
    }
  }

  // 2. Fetch from cloud storage API in parallel
  let cloudPhotos: CorporatePhoto[] = [];
  try {
    const res = await fetch(`/api/corporate/photos?eventId=${encodeURIComponent(eventId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data?.photos)) {
        cloudPhotos = data.photos as CorporatePhoto[];
      }
    }
  } catch (err) {
    console.warn("[corporate-service] Cloud photos fetch notice:", err);
  }

  // 3. MERGING LOGIC: Never let an empty cloud response overwrite local photos!
  const photoMap = new Map<string, CorporatePhoto>();
  // First add cloud photos
  for (const p of cloudPhotos) {
    if (p?.id) photoMap.set(p.id, p);
  }
  // Then add local photos (preserving any newly uploaded photos not yet synced to cloud)
  for (const p of localPhotos) {
    if (p?.id) {
      if (!photoMap.has(p.id)) {
        photoMap.set(p.id, p);
      } else {
        // Merge attributes, prefer valid non-empty URLs
        const existing = photoMap.get(p.id)!;
        photoMap.set(p.id, {
          ...existing,
          ...p,
          url: p.url || existing.url,
          thumbnail_url: p.thumbnail_url || existing.thumbnail_url || p.url,
          storage_path: p.storage_path || existing.storage_path,
        });
      }
    }
  }

  const combined = Array.from(photoMap.values());

  // 4. If local had photos that cloud didn't have, trigger background sync
  if (localPhotos.length > 0 && cloudPhotos.length < localPhotos.length) {
    try {
      fetch("/api/corporate/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          companyId: "corporate",
          photos: combined,
        }),
      }).catch(() => {});
    } catch {}
  }

  // 5. Update local cache with combined clean data
  if (combined.length > 0 && typeof window !== "undefined") {
    try {
      const cleanToStore = combined.map((p) => ({
        ...p,
        url: p.url && p.url.startsWith("data:") && p.url.length > 50000 ? (p.thumbnail_url || "") : p.url,
      }));
      window.localStorage.setItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`, JSON.stringify(cleanToStore));
    } catch (e) {
      console.warn("[corporate-service] Cache update notice:", e);
    }
  }

  return combined;
}

// Save corporate photos for an event
export async function saveCorporatePhotos(
  companyId: string,
  eventId: string,
  newPhotos: CorporatePhoto[]
): Promise<CorporatePhoto[]> {
  if (!eventId || !Array.isArray(newPhotos) || newPhotos.length === 0) {
    return getCorporatePhotos(eventId);
  }

  // Read existing photos from local storage
  let existing: CorporatePhoto[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) existing = parsed;
      }
    } catch {}
  }

  // Deduplicate by photo ID
  const map = new Map<string, CorporatePhoto>();
  for (const p of existing) {
    if (p?.id) map.set(p.id, p);
  }
  for (const p of newPhotos) {
    if (p?.id) map.set(p.id, p);
  }
  const combined = Array.from(map.values());

  // IMMEDIATELY save to localStorage so page refresh NEVER loses photos!
  if (typeof window !== "undefined") {
    try {
      const cleanToStore = combined.map((p) => ({
        ...p,
        url: p.url && p.url.startsWith("data:") && p.url.length > 50000 ? (p.thumbnail_url || "") : p.url,
      }));
      window.localStorage.setItem(`${STORAGE_KEY_PHOTOS_PREFIX}${eventId}`, JSON.stringify(cleanToStore));
    } catch (e) {
      console.warn("[corporate-service] localStorage save notice:", e);
    }
  }

  // Update photos count on the event
  const actualCompanyId = companyId || DEFAULT_COMPANY_ID;
  const totalFaces = combined.reduce((acc, p) => acc + (p.ai_faces_detected || 1), 0);
  await updateCorporateEvent(actualCompanyId, eventId, {
    photos_count: combined.length,
    ai_faces_indexed: totalFaces,
    cover_image_url: combined[0]?.url,
  });

  // Sync to Supabase storage manifest in background or await
  try {
    await fetch("/api/corporate/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        companyId: actualCompanyId,
        photos: combined,
      }),
    });
  } catch (err) {
    console.warn("[corporate-service] Cloud photos sync notice:", err);
  }

  return combined;
}

// Delete corporate photo
export async function deleteCorporatePhoto(
  companyId: string,
  eventId: string,
  photoId: string
): Promise<boolean> {
  const actualCompanyId = companyId || DEFAULT_COMPANY_ID;
  // Call cloud storage API to delete
  try {
    await fetch(`/api/corporate/photos?eventId=${encodeURIComponent(eventId)}&photoId=${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("[corporate-service] Cloud photo delete notice:", e);
  }

  // Remove from localStorage
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
  await updateCorporateEvent(actualCompanyId, eventId, {
    photos_count: remaining.length,
    ai_faces_indexed: totalFaces,
    cover_image_url: remaining[0]?.url,
  });

  return true;
}


