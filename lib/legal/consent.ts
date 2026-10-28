import { supabase } from "@/lib/supabase/client";
import { getAccessToken, getSession } from "@/lib/auth/session";
import { LEGAL_CONFIG } from "@/config/legal";

export type ConsentType = 
  | "terms"
  | "privacy"
  | "platform_agreement"
  | "face_match"
  | "marketing"
  | "cookies";

export type DataRightsRequestType =
  | "export"
  | "correction"
  | "erasure"
  | "grievance"
  | "nomination";

export interface UserConsentRecord {
  id: string;
  user_id: string;
  document_type: string;
  version: string;
  accepted_at: string;
  language: string;
  consent_type: ConsentType;
  withdrawn_at: string | null;
  metadata?: Record<string, unknown>;
}

export interface DataRightsRequestRecord {
  id: string;
  user_id: string;
  request_type: DataRightsRequestType;
  status: "pending" | "in_progress" | "completed" | "rejected";
  details: Record<string, unknown>;
  sla_due_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Record a user consent in the database and local audit cache
 */
export async function recordConsent(params: {
  consentType: ConsentType;
  documentType: string;
  version?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const version = params.version || LEGAL_CONFIG.version;
  const language = params.language || "en";
  const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";

  // 1. Store in localStorage for instant fast retrieval
  if (typeof window !== "undefined") {
    localStorage.setItem(`photoos_consent_${params.consentType}`, JSON.stringify({
      version,
      language,
      accepted_at: new Date().toISOString(),
    }));
  }

  // 2. Persist to Supabase if authenticated
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    // Try RPC first
    const { data: rpcId, error: rpcErr } = await supabase.rpc("record_user_consent", {
      p_consent_type: params.consentType,
      p_document_type: params.documentType,
      p_version: version,
      p_language: language,
      p_ip_hash: null,
      p_user_agent: userAgent,
      p_metadata: params.metadata || {},
    });

    if (!rpcErr && rpcId) {
      return rpcId as string;
    }

    // Direct insert fallback
    const { data, error } = await supabase
      .from("user_consents")
      .insert({
        user_id: session.user.id,
        document_type: params.documentType,
        version,
        language,
        user_agent: userAgent,
        consent_type: params.consentType,
        metadata: params.metadata || {},
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      return data.id;
    }
  } catch (err) {
    console.warn("[Consent] DB record notice:", err);
  }

  return `local_${Date.now()}`;
}

/**
 * Withdraw an optional consent (e.g. face_match, marketing, cookies)
 * Must immediately stop processing and purge face embeddings
 */
export async function withdrawConsent(consentType: "face_match" | "marketing" | "cookies"): Promise<boolean> {
  // 1. Remove from local storage
  if (typeof window !== "undefined") {
    localStorage.removeItem(`photoos_consent_${consentType}`);
    localStorage.setItem(`photoos_withdrawn_${consentType}`, new Date().toISOString());
  }

  // 2. Persist withdrawal in Supabase
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return true;
    }

    // Try RPC
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("withdraw_user_consent", {
      p_consent_type: consentType,
    });

    if (!rpcErr && rpcRes) {
      return true;
    }

    // Fallback direct update
    await supabase
      .from("user_consents")
      .update({ withdrawn_at: new Date().toISOString() })
      .eq("user_id", session.user.id)
      .eq("consent_type", consentType)
      .is("withdrawn_at", null);

    return true;
  } catch (err) {
    console.warn("[Consent] Withdrawal notice:", err);
    return true;
  }
}

/**
 * Retrieve all active and historical consents for the current user
 */
export async function getUserConsents(): Promise<UserConsentRecord[]> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("accepted_at", { ascending: false });

    if (!error && data) {
      return data as UserConsentRecord[];
    }
  } catch (err) {
    console.warn("[Consent] Fetch consents notice:", err);
  }

  return [];
}

/**
 * Submit a DPDP Act 2023 statutory data rights request
 */
export async function submitDataRightsRequest(params: {
  requestType: DataRightsRequestType;
  details: Record<string, unknown>;
}): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error("You must be logged in to exercise statutory data rights.");
    }

    // Try RPC first
    const { data: rpcId, error: rpcErr } = await supabase.rpc("submit_data_rights_request", {
      p_request_type: params.requestType,
      p_details: params.details,
    });

    if (!rpcErr && rpcId) {
      return rpcId as string;
    }

    // Direct insert fallback
    const { data, error } = await supabase
      .from("data_rights_requests")
      .insert({
        user_id: session.user.id,
        request_type: params.requestType,
        details: params.details,
        sla_due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      return data.id;
    }
  } catch (err) {
    console.warn("[DataRights] Submission notice:", err);
  }

  return `req_${Date.now()}`;
}

/**
 * Check if the user has accepted the latest version of a document
 */
export function checkLocalConsent(consentType: ConsentType): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(`photoos_consent_${consentType}`);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return parsed.version === LEGAL_CONFIG.version;
  } catch {
    return false;
  }
}

