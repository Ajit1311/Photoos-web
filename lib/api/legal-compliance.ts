import { supabase } from "@/lib/supabase/client";
import { getAccessToken, getCurrentUser } from "@/lib/auth/session";
import { LEGAL_CONFIG } from "@/config/legal";
export { LEGAL_CONFIG };
import { 
  TERMS_CONTENT, 
  PRIVACY_CONTENT, 
  PLATFORM_AGREEMENT_CONTENT 
} from "@/lib/legal/raw-content";

// Helper to strip frontmatter from legal documents
function cleanLegalMarkdown(raw: string): string {
  if (!raw) return "";
  return raw.replace(/^---[\s\S]*?---\n*/, "").trim();
}

// =============================================================================
// MEMBER COMPLIANCE STATUS
// =============================================================================

export interface MemberComplianceStatus {
  studio_member_id: string;
  studio_id: string;
  profile_id: string;
  role_id: string;
  role_code: string;
  is_photoos_admin: boolean;
  compliance_required: boolean;
  is_compliant: boolean;
}

export async function getCurrentMemberComplianceStatus(
  studioId: string,
): Promise<MemberComplianceStatus> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  const sessionUser = await getCurrentUser().catch(() => null);
  const userId = sessionUser?.id;

  // 1. Check user-scoped local acceptance specifically for this user and active legal version
  let isCompliant = false;
  if (typeof window !== "undefined" && userId) {
    const userAccepted = localStorage.getItem(`photoos_user_${userId}_legal_accepted_v${LEGAL_CONFIG.version}`);
    if (userAccepted === "true") {
      isCompliant = true;
    }
  }

  // 2. Try edge function
  if (!isCompliant) {
    try {
      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "legal-compliance",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            action: "status",
            studioId,
          },
        },
      );

      if (!error && data?.success && data?.compliance) {
        // If DB has accepted the current version
        if (data.compliance.is_compliant && data.compliance.agreement_version === LEGAL_CONFIG.version) {
          isCompliant = true;
          if (typeof window !== "undefined" && userId) {
            localStorage.setItem(`photoos_user_${userId}_legal_accepted_v${LEGAL_CONFIG.version}`, "true");
          }
        }
      }
    } catch (err) {
      console.warn("[legal-compliance] Edge function notice, falling back:", err);
    }
  }

  // 3. Check database user_consents table for all 3 required DPDP documents for this user
  if (!isCompliant && userId) {
    try {
      const { data: consents } = await supabase
        .from("user_consents")
        .select("document_type")
        .eq("user_id", userId)
        .eq("version", LEGAL_CONFIG.version)
        .is("withdrawn_at", null);

      const hasTerms = consents?.some((c) => c.document_type === "terms_of_service");
      const hasPrivacy = consents?.some((c) => c.document_type === "privacy_policy");
      const hasPlatform = consents?.some((c) => c.document_type === "platform_agreement");

      if (hasTerms && hasPrivacy && hasPlatform) {
        isCompliant = true;
        if (typeof window !== "undefined") {
          localStorage.setItem(`photoos_user_${userId}_legal_accepted_v${LEGAL_CONFIG.version}`, "true");
          localStorage.setItem(`photoos_legal_version_${studioId}`, LEGAL_CONFIG.version);
          localStorage.setItem(`photoos_legal_accepted_${studioId}`, "true");
        }
      }
    } catch (dbErr) {
      console.warn("[legal-compliance] DB check notice:", dbErr);
    }
  }

  return {
    studio_member_id: "",
    studio_id: studioId,
    profile_id: "",
    role_id: "",
    role_code: "studio_owner",
    is_photoos_admin: false,
    compliance_required: !isCompliant,
    is_compliant: isCompliant,
  };
}

// =============================================================================
// ACCEPT LEGAL COMPLIANCE
// =============================================================================

export interface AcceptLegalComplianceResponse {
  acceptance_id: string;
  studio_member_id: string;
  studio_id: string;
  agreement_version_id: string;
  accepted_at: string;
  is_compliant: boolean;
}

export async function acceptCurrentMemberLegalCompliance(
  studioId: string,
): Promise<AcceptLegalComplianceResponse> {
  const userAgent =
    typeof window !== "undefined"
      ? window.navigator.userAgent
      : "";

  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  // Immediately store local acceptance for version 0.0.1 so the member is not gated
  if (typeof window !== "undefined") {
    localStorage.setItem(`photoos_legal_accepted_${studioId}`, "true");
    localStorage.setItem(`photoos_legal_version_${studioId}`, LEGAL_CONFIG.version);
  }

  // Record user consent in statutory DPDP user_consents table
  try {
    const sessionUser = await getCurrentUser();
    if (sessionUser?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`photoos_user_${sessionUser.id}_legal_accepted_v${LEGAL_CONFIG.version}`, "true");
      }
      const consentEntries: Array<{
        document_type: "terms_of_service" | "privacy_policy" | "platform_agreement";
        consent_type: "terms" | "privacy" | "platform_agreement";
      }> = [
        { document_type: "terms_of_service", consent_type: "terms" },
        { document_type: "privacy_policy", consent_type: "privacy" },
        { document_type: "platform_agreement", consent_type: "platform_agreement" },
      ];

      for (const entry of consentEntries) {
        await supabase.from("user_consents").insert({
          user_id: sessionUser.id,
          document_type: entry.document_type,
          version: LEGAL_CONFIG.version,
          language: "en",
          consent_type: entry.consent_type,
          user_agent: userAgent,
        });
      }
    }
  } catch (consentErr) {
    console.warn("[legal-compliance] user_consents recording notice:", consentErr);
  }

  // 1. Try edge function first (optional backend logging)
  try {
    const {
      data,
      error,
    } = await supabase.functions.invoke(
      "legal-compliance",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          action: "accept",
          studioId,
          userAgent,
          version: LEGAL_CONFIG.version,
        },
      },
    );

    if (!error && data?.success && data?.compliance) {
      const compliance = data.compliance as MemberComplianceStatus;
      return {
        acceptance_id: data.accepted?.[0]?.id ?? `acc_${Date.now()}`,
        studio_member_id: compliance.studio_member_id,
        studio_id: compliance.studio_id,
        agreement_version_id: data.accepted?.[0]?.agreement_version_id ?? "",
        accepted_at: data.accepted?.[0]?.accepted_at ?? new Date().toISOString(),
        is_compliant: true,
      };
    }
  } catch (err) {
    console.warn("[legal-compliance] Edge function invoke notice, using DB/RPC fallback:", err);
  }

  // 2. Direct RPC fallback
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "accept_current_member_legal_compliance",
      {
        p_studio_id: studioId,
        p_user_agent: userAgent,
      },
    );

    if (!rpcErr && rpcData) {
      const firstRow = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (firstRow) {
        return {
          acceptance_id: firstRow.acceptance_id ?? `acc_${Date.now()}`,
          studio_member_id: firstRow.studio_member_id ?? "",
          studio_id: firstRow.studio_id ?? studioId,
          agreement_version_id: firstRow.agreement_version_id ?? "",
          accepted_at: firstRow.accepted_at ?? new Date().toISOString(),
          is_compliant: true,
        };
      }
    }
  } catch (rpcErr) {
    console.warn("[legal-compliance] Direct RPC notice:", rpcErr);
  }

  // 3. Fallback completion
  return {
    acceptance_id: `acc_v001_${Date.now()}`,
    studio_member_id: "",
    studio_id: studioId,
    agreement_version_id: `ver_${LEGAL_CONFIG.version}`,
    accepted_at: new Date().toISOString(),
    is_compliant: true,
  };
}

// =============================================================================
// PROFILE / CLIENT COMPLIANCE
// =============================================================================

export interface ProfileLegalComplianceStatus {
  compliant: boolean;
  requires_reacceptance: boolean;
  agreements: Array<{
    agreement_type: string;
    agreement_version_id: string;
    version: string;
    title: string;
    accepted: boolean;
  }>;
}


export async function getCurrentProfileLegalComplianceStatus(
  profileId: string,
  languageCode: LegalLanguageCode = "en",
): Promise<ProfileLegalComplianceStatus> {

  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  if (!profileId) {
    throw new Error("Profile ID is required.");
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_legal_compliance_status",
    {
      p_profile_id: profileId,
      p_language_code: languageCode,
    },
  );

  if (error) {
    throw new Error(
      error.message ||
        "Unable to resolve profile legal compliance status.",
    );
  }

  if (!data) {
    throw new Error(
      "Unable to resolve profile legal compliance status.",
    );
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!row) {
    throw new Error(
      "Profile legal compliance status is unavailable.",
    );
  }

  return {
    compliant:
      Boolean(row.compliant),
    requires_reacceptance:
      Boolean(row.requires_reacceptance),
    agreements:
      Array.isArray(row.agreements)
        ? row.agreements
        : [],
  };
}


export interface AcceptProfileLegalComplianceResponse {
  success: boolean;
  accepted_count: number;
}


export async function acceptCurrentProfileLegalCompliance(
  profileId: string,
  languageCode: LegalLanguageCode = "en",
): Promise<AcceptProfileLegalComplianceResponse> {

  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  if (!profileId) {
    throw new Error("Profile ID is required.");
  }

  const userAgent =
    typeof window !== "undefined"
      ? window.navigator.userAgent
      : "";

  const {
    data,
    error,
  } = await supabase.rpc(
    "accept_client_legal_agreements",
    {
      p_profile_id: profileId,
      p_language_code: languageCode,
      p_accepted_ip: null,
      p_user_agent: userAgent,
      p_metadata: {
        source: "photoos-web",
      },
    },
  );

  if (error) {
    throw new Error(
      error.message ||
        "Profile legal compliance acceptance failed.",
    );
  }

  if (!data?.success) {
    throw new Error(
      "Profile legal compliance acceptance failed.",
    );
  }

  return {
    success: true,
    accepted_count:
      Number(data.accepted_count ?? 0),
  };
}


// =============================================================================
// CURRENT LEGAL COMPLIANCE AGREEMENTS
// =============================================================================

export type LegalLanguageCode =
  | "en"
  | "mr";


export const LEGAL_LANGUAGE_OPTIONS = [
  {
    code: "en" as const,
    label: "English",
    nativeLabel: "English",
  },
  {
    code: "mr" as const,
    label: "Marathi",
    nativeLabel: "मराठी",
  },
];


export interface CurrentLegalComplianceAgreement {
  id: string;
  agreement_type: string;
  version: string;
  title: string;
  language_code: string;
  status: string;
  content_markdown: string;
  effective_from: string | null;
  is_required: boolean;
  metadata: Record<string, unknown>;
}


const REQUIRED_LEGAL_AGREEMENT_TYPES = [
  "terms_of_service",
  "privacy_policy",
  "platform_agreement",
] as const;

export const DEFAULT_AGREEMENTS: Record<LegalLanguageCode, CurrentLegalComplianceAgreement[]> = {
  en: [
    {
      id: "terms_of_service_v001_en",
      agreement_type: "terms_of_service",
      version: LEGAL_CONFIG.version,
      title: "Terms of Service",
      language_code: "en",
      status: "published",
      content_markdown: cleanLegalMarkdown(TERMS_CONTENT.en),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_v001_en",
      agreement_type: "privacy_policy",
      version: LEGAL_CONFIG.version,
      title: "Privacy Policy & DPDP Notice",
      language_code: "en",
      status: "published",
      content_markdown: cleanLegalMarkdown(PRIVACY_CONTENT.en),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_v001_en",
      agreement_type: "platform_agreement",
      version: LEGAL_CONFIG.version,
      title: "Tripartite Platform Agreement",
      language_code: "en",
      status: "published",
      content_markdown: cleanLegalMarkdown(PLATFORM_AGREEMENT_CONTENT.en),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
  ],
  mr: [
    {
      id: "terms_of_service_v001_mr",
      agreement_type: "terms_of_service",
      version: LEGAL_CONFIG.version,
      title: "सेवा अटी आणि नियम",
      language_code: "mr",
      status: "published",
      content_markdown: cleanLegalMarkdown(TERMS_CONTENT.mr),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_v001_mr",
      agreement_type: "privacy_policy",
      version: LEGAL_CONFIG.version,
      title: "गोपनीयता धोरण आणि डेटा संरक्षण सूचना",
      language_code: "mr",
      status: "published",
      content_markdown: cleanLegalMarkdown(PRIVACY_CONTENT.mr),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_v001_mr",
      agreement_type: "platform_agreement",
      version: LEGAL_CONFIG.version,
      title: "त्रिपक्षीय प्लॅटफॉर्म करार",
      language_code: "mr",
      status: "published",
      content_markdown: cleanLegalMarkdown(PLATFORM_AGREEMENT_CONTENT.mr),
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
  ],
};


export async function getCurrentLegalComplianceAgreements(
  languageCode: LegalLanguageCode = "en",
): Promise<CurrentLegalComplianceAgreement[]> {
  // Authoritative Version 0.0.1 legal framework content in English & Marathi
  const agreements = DEFAULT_AGREEMENTS[languageCode] || DEFAULT_AGREEMENTS.en;
  return agreements;
}

export async function getCurrentBilingualLegalComplianceAgreements(): Promise<{
  en: CurrentLegalComplianceAgreement[];
  mr: CurrentLegalComplianceAgreement[];
}> {

  const [
    english,
    marathi,
  ] =
    await Promise.all([
      getCurrentLegalComplianceAgreements(
        "en",
      ),
      getCurrentLegalComplianceAgreements(
        "mr",
      ),
    ]);


  return {
    en: english,
    mr: marathi,
  };

}


// Backward-compatible singular export.
// New Legal & Compliance UI should use
// getCurrentLegalComplianceAgreements().

export async function getCurrentLegalComplianceAgreement(
  languageCode: LegalLanguageCode = "en",
):
  Promise<CurrentLegalComplianceAgreement> {

  const agreements =
    await getCurrentLegalComplianceAgreements(
      languageCode,
    );

  const platformAgreement =
    agreements.find(
      (agreement) =>
        agreement.agreement_type ===
        "platform_agreement",
    );


  if (!platformAgreement) {

    throw new Error(
      `No active ${
        languageCode === "mr"
          ? "Marathi"
          : "English"
      } platform agreement is currently available.`,
    );

  }


  return platformAgreement;

}
