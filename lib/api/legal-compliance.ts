import { supabase } from "@/lib/supabase/client";
import { getAccessToken } from "@/lib/auth/session";


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

  if (error) {
    let detail = error.message;

    try {
      const context =
        (error as { context?: Response }).context;

      if (context) {
        const body =
          await context.clone().text();

        if (body) {
          detail =
            `${error.message} | ${body}`;
        }
      }
    } catch {
      // Keep original error message.
    }

    throw new Error(detail);
  }

  if (!data?.success || !data?.compliance) {
    throw new Error(
      data?.error ??
        "Unable to resolve member compliance status.",
    );
  }

  return data.compliance as MemberComplianceStatus;

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
    typeof window !==
    "undefined"
      ? window.navigator.userAgent
      : "";


  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

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
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success || !data?.compliance) {
    throw new Error(
      data?.error ??
        "Legal compliance acceptance failed.",
    );
  }

  const compliance =
    data.compliance as MemberComplianceStatus;

  return {
    acceptance_id:
      data.accepted?.[0]?.id ?? "",
    studio_member_id:
      compliance.studio_member_id,
    studio_id:
      compliance.studio_id,
    agreement_version_id:
      data.accepted?.[0]?.agreement_version_id ?? "",
    accepted_at:
      data.accepted?.[0]?.accepted_at ??
      new Date().toISOString(),
    is_compliant:
      compliance.is_compliant,
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


export async function getCurrentLegalComplianceAgreements(
  languageCode: LegalLanguageCode = "en",
): Promise<CurrentLegalComplianceAgreement[]> {

  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

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
        action: "agreements",
        language: languageCode,
      },
    },
  );

  if (error) {
    let detail = error.message;

    try {
      const context =
        (error as { context?: Response }).context;

      if (context) {
        const body =
          await context.clone().text();

        if (body) {
          detail =
            `${error.message} | ${body}`;
        }
      }
    } catch {
      // Keep original error message.
    }

    throw new Error(detail);
  }

  if (
    !data?.success ||
    !Array.isArray(data?.agreements)
  ) {
    throw new Error(
      data?.error ??
        "Unable to load current legal compliance agreements.",
    );
  }

  const agreements =
    data.agreements as CurrentLegalComplianceAgreement[];

  const missingAgreementTypes =
    REQUIRED_LEGAL_AGREEMENT_TYPES.filter(
      (agreementType) =>
        !agreements.some(
          (agreement) =>
            agreement.agreement_type ===
            agreementType,
        ),
    );

  if (
    missingAgreementTypes.length > 0
  ) {
    const languageName =
      languageCode === "mr"
        ? "Marathi"
        : "English";

    throw new Error(
      `Required ${languageName} legal compliance agreements are unavailable: ${missingAgreementTypes.join(", ")}.`,
    );
  }

  return REQUIRED_LEGAL_AGREEMENT_TYPES.map(
    (agreementType) =>
      agreements.find(
        (agreement) =>
          agreement.agreement_type ===
          agreementType,
      )!,
  );
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
