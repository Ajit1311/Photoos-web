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
    name: "Enterprise Tech Solutions",
    work_email: "team@company.com",
    contact_person: "HR & People Team",
    phone: "+91 98765 43210",
    industry: "IT & Software Services",
    company_size: "100-500 Employees",
    location: "Corporate Tower, Tech Park, Mumbai",
    website: "https://photoos.in",
    logo_url: "",
    theme_color: "#0A3F61",
    compliance_accepted: true,
    compliance_accepted_at: now.toISOString(),
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
  const now = new Date();
  return [
    {
      id: "ev_corp_annual_day_2026",
      company_id: companyId,
      name: "Annual Corporate Day & Excellence Awards 2026",
      event_type: "Annual Day",
      date: new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10),
      location: "Grand Ballroom, The St. Regis, Mumbai",
      description: "Celebrating company achievements, team awards, and cultural night performances.",
      cover_image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      photos_count: 642,
      ai_faces_indexed: 598,
      allow_downloads: true,
      status: "active",
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: "ev_corp_townhall_q3",
      company_id: companyId,
      name: "Q3 All-Hands Executive Townhall",
      event_type: "Townhall",
      date: new Date(now.getTime() - 10 * 86400000).toISOString().slice(0, 10),
      location: "Main Auditorium, Level 4 Office",
      description: "Quarterly business review, executive Q&A, and new product roadmap reveal.",
      cover_image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      photos_count: 184,
      ai_faces_indexed: 180,
      allow_downloads: true,
      status: "active",
      created_at: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      id: "ev_corp_diwali_party",
      company_id: companyId,
      name: "Diwali Corporate Gala & Ethnic Celebration",
      event_type: "Festive Celebration",
      date: new Date(now.getTime() - 25 * 86400000).toISOString().slice(0, 10),
      location: "Office Rooftop Lounge",
      description: "Traditional attire day, team potluck, rangoli competition, and festive photo booths.",
      cover_image_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
      photos_count: 420,
      ai_faces_indexed: 412,
      allow_downloads: true,
      status: "completed",
      created_at: new Date(now.getTime() - 26 * 86400000).toISOString(),
    },
  ];
}

// Get corporate company data
export async function getCorporateCompany(): Promise<CorporateCompany> {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_COMPANY);
      if (stored) {
        const company = JSON.parse(stored) as CorporateCompany;
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
        return JSON.parse(stored) as CorporateEvent[];
      }
    } catch {
      // fallback
    }
  }

  const defaultEvents = getDefaultCorporateEvents(companyId);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_EVENTS}_${companyId}`, JSON.stringify(defaultEvents));
    } catch {
      // ignore
    }
  }
  return defaultEvents;
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
    } catch {
      // ignore
    }
  }

  return newEvent;
}
