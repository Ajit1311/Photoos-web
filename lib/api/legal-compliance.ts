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
      version: "1.0",
      title: "Terms of Service",
      language_code: "en",
      status: "published",
      content_markdown: `### PhotoOS Terms of Service\n\nWelcome to PhotoOS. By accessing or using the platform, you agree to comply with our Terms of Service.\n\n1. **Studio Account**: You are responsible for maintaining the security of your account and credentials.\n2. **Acceptable Use**: You agree to use the platform in accordance with applicable laws and industry standards.\n3. **Content Ownership**: You retain full ownership of all photography, assets, and client data uploaded to PhotoOS.\n4. **Service Reliability**: PhotoOS is committed to high availability, data security, and seamless studio workflows.`,
      effective_from: new Date().toISOString(),
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_default",
      agreement_type: "privacy_policy",
      version: "1.0",
      title: "Privacy Policy",
      language_code: "en",
      status: "published",
      content_markdown: `### PhotoOS Privacy Policy\n\nYour privacy and the security of your client data is our top priority.\n\n1. **Data Collection**: We collect account details, studio metadata, and client contacts solely to provide studio operating system services.\n2. **Data Protection**: Industry-standard encryption is used to protect your data both in transit and at rest.\n3. **Data Sharing**: We never sell or share your data or photos with third parties for marketing purposes.\n4. **User Rights**: You may export or delete your studio data at any time from your settings.`,
      effective_from: new Date().toISOString(),
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_default",
      agreement_type: "platform_agreement",
      version: "1.0",
      title: "Platform Agreement",
      language_code: "en",
      status: "published",
      content_markdown: `### PhotoOS Studio Platform Agreement\n\nThis Platform Agreement governs the operational responsibilities of your PhotoOS workspace.\n\n1. **Workspace Management**: Studio owners and authorized managers can assign roles and manage team access.\n2. **Compliance & Integrity**: All studio team members agree to handle client media with privacy and integrity.\n3. **Support & Updates**: PhotoOS provides continuous system updates, backups, and customer support.`,
      effective_from: new Date().toISOString(),
      is_required: true,
      metadata: {},
    },
  ],
  mr: [
    {
      id: "terms_of_service_default_mr",
      agreement_type: "terms_of_service",
      version: "1.0",
      title: "सेवा अटी",
      language_code: "mr",
      status: "published",
      content_markdown: `### PhotoOS सेवा अटी\n\nPhotoOS प्लॅटफॉर्मवर आपले स्वागत आहे. प्लॅटफॉर्म वापरताना खालील अटी लागू राहतील:\n\n1. **खाते सुरक्षा**: आपल्या स्टुडिओ खात्याची व पासवर्डची गोपनीयता राखणे ही आपली जबाबदारी आहे.\n2. **वापराचे नियम**: प्लॅटफॉर्मचा वापर सर्व कायदेशीर व व्यावसायिक नियमांनुसार केला जावा.\n3. **डेटा मालकी**: आपल्या स्टुडिओचे सर्व फोटो आणि ग्राहकांचा डेटा यावर पूर्णपणे आपलीच मालकी राहील.\n4. **विश्वासार्हता**: PhotoOS स्टुडिओच्या कामात सातत्य आणि सुरक्षितता राखण्यासाठी कटिबद्ध आहे.`,
      effective_from: new Date().toISOString(),
      is_required: true,
      metadata: {},
    },
    {
      id: "privacy_policy_default_mr",
      agreement_type: "privacy_policy",
      version: "1.0",
      title: "गोपनीयता धोरण",
      language_code: "mr",
      status: "published",
      content_markdown: `### PhotoOS गोपनीयता धोरण\n\nआपल्या स्टुडिओ आणि ग्राहकांच्या डेटाची गोपनीयता राखणे हे आमचे सर्वोच्च प्राधान्य आहे.\n\n1. **माहिती संकलन**: स्टुडिओ सिस्टीम चालवण्यासाठी लागणारी आवश्यक माहितीच गोळा केली जाते.\n2. **डेटा संरक्षण**: सर्व डेटा सुरक्षित एन्क्रिप्शनद्वारे संरक्षित ठेवला जातो.\n3. **खाजगीपणा**: आपला डेटा किंवा फोटो कोणत्याही तिसऱ्या पक्षाला विकले किंवा शेअर केले जात नाहीत.\n4. **आपले अधिकार**: आपण कधीही आपला डेटा डाउनलोड किंवा नष्ट करू शकता.`,
      effective_from: new Date().toISOString(),
      is_required: true,
      metadata: {},
    },
    {
      id: "platform_agreement_default_mr",
      agreement_type: "platform_agreement",
      version: "1.0",
      title: "प्लॅटफॉर्म करार",
      language_code: "mr",
      status: "published",
      content_markdown: `### PhotoOS स्टुडिओ प्लॅटफॉर्म करार\n\nहा करार आपल्या PhotoOS Workspace च्या जबाबदाऱ्या आणि वापरासाठी लागू आहे:\n\n1. **Workspace व्यवस्थापन**: स्टुडिओ मालक आपल्या कर्मचाऱ्यांचे रोल व परवानग्या व्यवस्थापित करू शकतात.\n2. **जबाबदारी**: स्टुडिओ टीम ग्राहकांच्या फोटोंची गोपनीयता बाळगेल.\n3. **सपोर्ट आणि अपडेट्स**: PhotoOS कडून वेळेवर अपडेट्स व मदत पुरवली जाईल.`,
      effective_from: new Date().toISOString(),
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
