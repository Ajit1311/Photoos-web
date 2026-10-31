"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  FileCheck2,
  FileText,
  LockKeyhole,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/session";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  getCurrentMemberComplianceStatus,
  getCurrentLegalComplianceAgreements,
  acceptCurrentMemberLegalCompliance,
  getCurrentProfileLegalComplianceStatus,
  acceptCurrentProfileLegalCompliance,
  LEGAL_LANGUAGE_OPTIONS,
} from "@/lib/api/legal-compliance";

import { supabase } from "@/lib/supabase/client";
import { LEGAL_CONFIG } from "@/config/legal";

import type {
  CurrentLegalComplianceAgreement,
  LegalLanguageCode,
} from "@/lib/api/legal-compliance";


type PageState =
  | "loading"
  | "ready"
  | "accepting"
  | "error";


const AGREEMENT_META: Record<
  string,
  {
    label: string;
    shortLabel: string;
    description: string;
    mrLabel: string;
    mrShortLabel: string;
    mrDescription: string;
  }
> = {
  terms_of_service: {
    label: "Terms of Service",
    shortLabel: "Terms",
    description:
      "The rules and conditions governing your use of PhotoOS.",
    mrLabel: "सेवा अटी",
    mrShortLabel: "अटी",
    mrDescription:
      "PhotoOS वापरताना लागू होणाऱ्या अटी व नियम.",
  },

  privacy_policy: {
    label: "Privacy Policy",
    shortLabel: "Privacy",
    description:
      "How PhotoOS handles personal information and privacy.",
    mrLabel: "गोपनीयता धोरण",
    mrShortLabel: "गोपनीयता",
    mrDescription:
      "PhotoOS तुमच्या वैयक्तिक माहितीचा वापर व संरक्षण कसे करते.",
  },

  platform_agreement: {
    label: "Platform Agreement",
    shortLabel: "Platform",
    description:
      "The responsibilities and operating requirements for your workspace.",
    mrLabel: "प्लॅटफॉर्म करार",
    mrShortLabel: "प्लॅटफॉर्म",
    mrDescription:
      "तुमच्या workspace साठी लागू असलेल्या जबाबदाऱ्या व वापराच्या अटी.",
  },
};


function getAgreementMeta(
  agreementType: string,
  languageCode: LegalLanguageCode = "en",
) {
  const meta =
    AGREEMENT_META[agreementType];

  if (!meta) {
    return {
      label: agreementType
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        ),

      shortLabel:
        languageCode === "mr"
          ? "करार"
          : "Agreement",

      description:
        languageCode === "mr"
          ? "आवश्यक PhotoOS कायदेशीर करार."
          : "A required PhotoOS legal agreement.",

      mrLabel: "",
      mrShortLabel: "",
      mrDescription: "",
    };
  }

  return {
    label:
      languageCode === "mr"
        ? meta.mrLabel
        : meta.label,

    shortLabel:
      languageCode === "mr"
        ? meta.mrShortLabel
        : meta.shortLabel,

    description:
      languageCode === "mr"
        ? meta.mrDescription
        : meta.description,

    mrLabel: meta.mrLabel,
    mrShortLabel: meta.mrShortLabel,
    mrDescription: meta.mrDescription,
  };
}



const HIGHLIGHTS = [
  {
    number: "01",
    title: "One workspace",
    description:
      "These agreements work together to define how your PhotoOS workspace can be used.",
  },

  {
    number: "02",
    title: "Three documents",
    description:
      "Terms, Privacy and Platform responsibilities remain separate legal documents.",
  },

  {
    number: "03",
    title: "One confirmation",
    description:
      "Review all three documents, then confirm once to unlock your workspace.",
  },
];


const LEGAL_UI_TEXT = {
  en: {
    finalStep:
      "Final step before workspace access",

    reviewTitle:
      "Review your PhotoOS agreements",

    reviewDescription:
      "Before entering your workspace, please review the three current legal documents that govern your use of PhotoOS.",

    language:
      "Language",

    languageHint:
      "You can review the same three legal documents in either language.",

    agreementReview:
      "Agreement review",

    documentsReviewed:
      "documents reviewed",

    oneWorkspace:
      "One workspace",

    threeDocuments:
      "Three documents",

    oneConfirmation:
      "One confirmation",

    oneWorkspaceDescription:
      "These agreements work together to define how your PhotoOS workspace can be used.",

    threeDocumentsDescription:
      "Terms, Privacy and Platform responsibilities remain separate legal documents.",

    oneConfirmationDescription:
      "Review all three documents, then confirm once to unlock your workspace.",

    scrollToReview:
      "Scroll to review",

    documentReviewed:
      "Document reviewed",

    reviewComplete:
      "Review complete",

    reviewAllDocuments:
      "Please review all three legal documents to the end before accepting.",

    acceptContinue:
      "Accept & Continue",

    accepting:
      "Recording acceptance...",

    securePrivate:
      "Secure & private",

    finalConfirmation:
      "I have reviewed all three documents and agree to the applicable terms.",
  },

  mr: {
    finalStep:
      "Workspace access करण्यापूर्वीची अंतिम पायरी",

    reviewTitle:
      "तुमचे PhotoOS कायदेशीर करार तपासा",

    reviewDescription:
      "Workspace मध्ये प्रवेश करण्यापूर्वी PhotoOS च्या वापरासाठी लागू असलेली तीन वर्तमान कायदेशीर कागदपत्रे पूर्णपणे वाचा.",

    language:
      "भाषा",

    languageHint:
      "ही तीनही कायदेशीर कागदपत्रे तुम्ही तुमच्या पसंतीच्या भाषेत वाचू शकता.",

    agreementReview:
      "करारांचे पुनरावलोकन",

    documentsReviewed:
      "कागदपत्रांचे पुनरावलोकन पूर्ण",

    oneWorkspace:
      "एक Workspace",

    threeDocuments:
      "तीन कागदपत्रे",

    oneConfirmation:
      "एक पुष्टीकरण",

    oneWorkspaceDescription:
      "हे सर्व करार मिळून तुमच्या PhotoOS Workspace च्या वापरासाठी लागू असलेल्या नियमांची व्याख्या करतात.",

    threeDocumentsDescription:
      "सेवा अटी, गोपनीयता धोरण आणि प्लॅटफॉर्मच्या जबाबदाऱ्या ही स्वतंत्र कायदेशीर कागदपत्रे आहेत.",

    oneConfirmationDescription:
      "तीनही कागदपत्रे पूर्णपणे वाचा आणि त्यानंतर एकदाच पुष्टी करून Workspace unlock करा.",

    scrollToReview:
      "पुनरावलोकन करण्यासाठी खाली scroll करा",

    documentReviewed:
      "कागदपत्राचे पुनरावलोकन पूर्ण",

    reviewComplete:
      "पुनरावलोकन पूर्ण",

    reviewAllDocuments:
      "Accept करण्यापूर्वी कृपया तीनही कायदेशीर कागदपत्रे शेवटपर्यंत scroll करून वाचा.",

    acceptContinue:
      "स्वीकारा आणि पुढे जा",

    accepting:
      "स्वीकृती नोंदवत आहे...",

    securePrivate:
      "सुरक्षित आणि खाजगी",

    finalConfirmation:
      "मी तीनही कागदपत्रांचे पुनरावलोकन केले असून लागू असलेल्या अटींशी सहमत आहे.",
  },
} as const;


export default function LegalCompliancePage() {

  const router =
    useRouter();


  const agreementRefs =
    useRef<Array<HTMLDivElement | null>>([]);


  const [
    state,
    setState,
  ] =
    useState<PageState>(
      "loading",
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    agreements,
    setAgreements,
  ] =
    useState<
      CurrentLegalComplianceAgreement[]
    >([]);


  const [
    language,
    setLanguage,
  ] =
    useState<LegalLanguageCode>(
      "en",
    );


  const [
    languageLoading,
    setLanguageLoading,
  ] =
    useState(false);


  const ui =
    LEGAL_UI_TEXT[language];


  const [
    studioId,
    setStudioId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    accessMode,
    setAccessMode,
  ] =
    useState<"studio" | "corporate" | "freelancer">(
      "studio",
    );

  const [
    nextPath,
    setNextPath,
  ] =
    useState<string>(
      "/dashboard",
    );


  /*
   * Review state is intentionally session-only.
   *
   * Historical database acceptance must never make a
   * currently displayed agreement appear reviewed.
   */
  const [
    reviewed,
    setReviewed,
  ] =
    useState<Set<string>>(
      new Set(),
    );


  const [
    accepted,
    setAccepted,
  ] =
    useState(false);


  const reviewedCount =
    reviewed.size;


  const totalAgreements =
    agreements.length;


  const allReviewed =
    totalAgreements > 0 &&
    reviewedCount === totalAgreements;


  const progress =
    totalAgreements > 0
      ? Math.round(
          (reviewedCount /
            totalAgreements) *
            100,
        )
      : 0;


  const agreementOrder =
    useMemo(
      () =>
        [
          "terms_of_service",
          "privacy_policy",
          "platform_agreement",
        ],
      [],
    );


  async function loadAgreementsForLanguage(
    languageCode: LegalLanguageCode,
  ) {

    setLanguageLoading(
      true,
    );

    setError(
      null,
    );

    try {

      /*
       * Changing language creates a new review session.
       * Previously checked acceptance must not carry across
       * to the newly displayed language version.
       */
      setReviewed(new Set());
      setAccepted(false);

      const currentAgreements =
        await getCurrentLegalComplianceAgreements(
          languageCode,
        );


      const orderedAgreements =
        agreementOrder
          .map(
            (type) =>
              currentAgreements.find(
                (agreement) =>
                  agreement.agreement_type ===
                  type,
              ),
          )
          .filter(
            (
              agreement,
            ): agreement is CurrentLegalComplianceAgreement =>
              Boolean(
                agreement,
              ),
          );


      if (
        orderedAgreements.length !==
        agreementOrder.length
      ) {

        throw new Error(
          `All required ${
            languageCode === "mr"
              ? "Marathi"
              : "English"
          } legal agreements are not currently available.`,
        );

      }


      setAgreements(
        orderedAgreements,
      );

      /*
       * A language change starts a fresh review session.
       *
       * Previous acceptance history must never mark the
       * newly displayed language as already reviewed.
       */
      setReviewed(
        new Set(),
      );

      setAccepted(
        false,
      );

      setLanguage(
        languageCode,
      );

      /*
       * Scroll containers belong to the previous language
       * content. Clear them before the new documents render.
       */
      agreementRefs.current =
        [];

    } catch (
      languageError
    ) {

      console.error(
        "LEGAL LANGUAGE LOAD ERROR:",
        languageError,
      );

      setError(
        languageError instanceof Error
          ? languageError.message
          : "Unable to load the selected legal language.",
      );

    } finally {

      setLanguageLoading(
        false,
      );

    }

  }


  useEffect(() => {

    let cancelled =
      false;


    async function initialize() {

      try {

        const params =
          new URLSearchParams(
            window.location.search,
          );

        const freelancerMode =
          params.get("mode") === "freelancer";

        const requestedNext =
          params.get("next");

        const planParams = new URLSearchParams();
        const planId = params.get("planId");
        const planCode = params.get("planCode");
        const billingCycle = params.get("billingCycle");
        const modeParam = params.get("mode");
        if (planId) planParams.set("planId", planId);
        if (planCode) planParams.set("planCode", planCode);
        if (billingCycle) planParams.set("billingCycle", billingCycle);
        if (modeParam && modeParam !== "freelancer") planParams.set("mode", modeParam);
        const qs = planParams.toString();

        const corporateMode =
          params.get("mode") === "corporate" ||
          (requestedNext && requestedNext.includes("corporate")) ||
          (typeof window !== "undefined" && (
            window.location.hostname.startsWith("corp.") ||
            window.location.hostname.startsWith("corporate.") ||
            localStorage.getItem("photoos_login_mode") === "corporate"
          ));

        const safeNext =
          requestedNext &&
          requestedNext.startsWith("/") &&
          !requestedNext.startsWith("//") &&
          !requestedNext.startsWith("/legal-compliance")
            ? requestedNext
            : corporateMode
              ? "/corporate/onboarding"
              : freelancerMode
                ? "/freelancer/profile/create"
                : "/dashboard";


        if (freelancerMode) {

          const currentUser =
            await getCurrentUser();

          if (!currentUser) {

            router.replace(
              `/login?next=${encodeURIComponent(
                window.location.pathname +
                window.location.search,
              )}`,
            );

            return;

          }


          console.log(
            "LEGAL FREELANCER STEP 1: getCurrentProfileLegalComplianceStatus",
            currentUser.id,
          );

          const profileCompliance =
            await getCurrentProfileLegalComplianceStatus(
              currentUser.id,
              language,
            );

          console.log(
            "LEGAL FREELANCER PROFILE COMPLIANCE:",
            profileCompliance,
          );


          let currentAgreements;

          try {

            console.log(
              "LEGAL FREELANCER STEP 2: getCurrentLegalComplianceAgreements",
            );

            currentAgreements =
              await getCurrentLegalComplianceAgreements(
                "en",
              );

            console.log(
              "LEGAL FREELANCER STEP 2 SUCCESS:",
              currentAgreements,
            );

          } catch (error) {

            console.error(
              "LEGAL FREELANCER STEP 2 FAILED:",
              error,
            );

            throw error;

          }


          const orderedAgreements =
            agreementOrder
              .map(
                (type) =>
                  currentAgreements.find(
                    (agreement) =>
                      agreement.agreement_type ===
                      type,
                  ),
              )
              .filter(
                (
                  agreement,
                ): agreement is CurrentLegalComplianceAgreement =>
                  Boolean(agreement),
              );


          if (
            orderedAgreements.length !==
            agreementOrder.length
          ) {

            throw new Error(
              "All required English legal agreements are not currently available.",
            );

          }


          if (!cancelled) {

            setAccessMode(
              "freelancer",
            );

            setNextPath(
              safeNext,
            );

            setStudioId(
              null,
            );

            setLanguage(
              "en",
            );

            setAgreements(
              orderedAgreements,
            );

            setReviewed(
              new Set(),
            );

            setAccepted(
              false,
            );

            setState(
              "ready",
            );

          }

          return;

        }


        const sessionUser =
          await getCurrentUser();

        if (!sessionUser) {
          router.replace(
            `/login?next=${encodeURIComponent(
              window.location.pathname +
              window.location.search,
            )}`,
          );
          return;
        }


        let membership = null;
        try {
          membership = await resolveUserStudio();
        } catch {
          // Expected for new onboarding user
        }

        const resolvedStudioId = membership?.studioId ?? null;

        let compliance = {
          is_compliant: false,
          compliance_required: true,
          is_photoos_admin: false,
        };

        if (resolvedStudioId) {
          try {
            console.log(
              "LEGAL STEP 1: getCurrentMemberComplianceStatus",
              resolvedStudioId,
            );

            const memberCompliance =
              await getCurrentMemberComplianceStatus(
                resolvedStudioId,
              );

            compliance = {
              is_compliant: memberCompliance.is_compliant,
              compliance_required: memberCompliance.compliance_required,
              is_photoos_admin: memberCompliance.is_photoos_admin,
            };

            console.log(
              "LEGAL STEP 1 SUCCESS:",
              compliance,
            );
          } catch (error) {
            console.warn(
              "LEGAL STEP 1 NOTICE:",
              error,
            );
          }
        } else {
          // Check statutory DPDP user_consents table directly for current user
          try {
            const { data: consents } = await supabase
              .from("user_consents")
              .select("document_type")
              .eq("user_id", sessionUser.id)
              .eq("version", LEGAL_CONFIG.version)
              .is("withdrawn_at", null);

            const hasTerms = consents?.some((c) => c.document_type === "terms_of_service");
            const hasPrivacy = consents?.some((c) => c.document_type === "privacy_policy");
            const hasPlatform = consents?.some((c) => c.document_type === "platform_agreement");

            if (hasTerms && hasPrivacy && hasPlatform) {
              compliance = {
                is_compliant: true,
                compliance_required: false,
                is_photoos_admin: false,
              };
            }
          } catch (dbErr) {
            console.warn("[legal-compliance] Direct consent check notice:", dbErr);
          }
        }

        let currentAgreements;

        try {
          console.log(
            "LEGAL STEP 2: getCurrentLegalComplianceAgreements",
          );

          currentAgreements =
            await getCurrentLegalComplianceAgreements(
              "en",
            );

          console.log(
            "LEGAL STEP 2 SUCCESS:",
            currentAgreements,
          );
        } catch (error) {
          console.error(
            "LEGAL STEP 2 FAILED:",
            error,
          );

          throw error;
        }


        if (
          compliance.is_photoos_admin ===
          true
        ) {

          router.replace(
            "/dashboard",
          );

          return;

        }


        // Auto-redirect ONLY if this specific user has genuinely accepted the legal compliance agreements
        const isLocallyAccepted =
          typeof window !== "undefined" &&
          (Boolean(sessionUser?.id && localStorage.getItem(`photoos_user_${sessionUser.id}_legal_accepted_v${LEGAL_CONFIG.version}`) === "true") ||
           (corporateMode && localStorage.getItem("photoos_corporate_compliance_accepted") === "true"));

        const isCompliantNow =
          (compliance.is_compliant === true && compliance.compliance_required === false) ||
          isLocallyAccepted;

        if (isCompliantNow) {
          console.log("[legal-compliance] User already accepted legal agreements, navigating to:", safeNext);
          router.replace(safeNext);
          return;
        }


        const orderedAgreements =
          agreementOrder
            .map(
              (type) =>
                currentAgreements.find(
                  (agreement) =>
                    agreement.agreement_type ===
                    type,
                ),
            )
            .filter(
              (
                agreement,
              ): agreement is CurrentLegalComplianceAgreement =>
                Boolean(agreement),
            );


        if (
          orderedAgreements.length !==
          agreementOrder.length
        ) {

          throw new Error(
            "All required English legal agreements are not currently available.",
          );

        }


        if (!cancelled) {

          setAccessMode(
            corporateMode ? "corporate" : "studio",
          );

          setNextPath(
            safeNext,
          );

          setStudioId(
            corporateMode ? null : resolvedStudioId,
          );

          setLanguage(
            "en",
          );

          setAgreements(
            orderedAgreements,
          );

          /*
           * Always start the current page with zero
           * documents reviewed, regardless of historical
           * database acceptance.
           */
          setReviewed(
            new Set(),
          );

          setAccepted(
            false,
          );

          setState(
            "ready",
          );

        }

      } catch (
        initializationError
      ) {

        console.error(
          "LEGAL COMPLIANCE INITIALIZATION ERROR:",
          initializationError,
        );


        if (!cancelled) {

          setError(
            initializationError instanceof Error
              ? initializationError.message
              : "Unable to load the legal agreements.",
          );

          setState(
            "error",
          );

        }

      }

    }


    initialize();


    return () => {

      cancelled =
        true;

    };

  }, [
    agreementOrder,
    router,
  ]);


  function markReviewed(
    agreementId: string,
  ) {

    setReviewed(
      (previous) => {

        const next =
          new Set(previous);

        next.add(
          agreementId,
        );

        return next;

      },
    );

    setError(
      null,
    );

  }


  function handleAgreementScroll(
    agreement: CurrentLegalComplianceAgreement,
    index: number,
  ) {

    const element =
      agreementRefs.current[
        index
      ];


    if (!element) {

      return;

    }


    const reachedEnd =
      element.scrollTop +
        element.clientHeight >=
      element.scrollHeight - 12;


    if (reachedEnd) {

      markReviewed(
        agreement.id,
      );

    }

  }



  function scrollToAgreement(
    index: number,
  ) {

    agreementRefs.current[
      index
    ]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

  }


  async function handleAccept() {

    if (!allReviewed) {

      setError(
        "Please review all three legal agreements before continuing.",
      );

      return;

    }


    if (!accepted) {

      setError(
        language === "mr"
          ? "कृपया तीनही कायदेशीर कागदपत्रे स्वीकारत असल्याची पुष्टी करा."
          : "Please confirm that you accept all three agreements.",
      );

      return;

    }


    try {

      setError(
        null,
      );

      setState(
        "accepting",
      );


      if (
        accessMode === "freelancer"
      ) {

        const currentUser =
          await getCurrentUser();

        if (!currentUser) {

          throw new Error(
            language === "mr"
              ? "तुमचे authentication session उपलब्ध नाही."
              : "Your authentication session is no longer available.",
          );

        }


        await acceptCurrentProfileLegalCompliance(
          currentUser.id,
          language,
        );


        const profileCompliance =
          await getCurrentProfileLegalComplianceStatus(
            currentUser.id,
            language,
          );


        if (
          profileCompliance.compliant !==
          true
        ) {

          throw new Error(
            language === "mr"
              ? "तुमची कायदेशीर स्वीकृती पडताळता आली नाही. कृपया पुन्हा प्रयत्न करा."
              : "Your legal acceptance could not be verified. Please try again.",
          );

        }


        router.replace(
          nextPath,
        );

        return;

      }


      const isCorporateMode =
        accessMode === "corporate" ||
        nextPath.includes("corporate") ||
        (typeof window !== "undefined" && (
          window.location.search.includes("mode=corporate") ||
          window.location.hostname.startsWith("corp.") ||
          window.location.hostname.startsWith("corporate.") ||
          localStorage.getItem("photoos_login_mode") === "corporate"
        ));

      const currentUser = await getCurrentUser();
      if (!currentUser && !isCorporateMode) {
        throw new Error(
          language === "mr"
            ? "तुमचे authentication session उपलब्ध नाही."
            : "Your authentication session is no longer available.",
        );
      }

      // Record consents in statutory DPDP user_consents table if user session is present
      if (currentUser) {
        const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
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
            user_id: currentUser.id,
            document_type: entry.document_type,
            version: LEGAL_CONFIG.version,
            language,
            consent_type: entry.consent_type,
            user_agent: userAgent,
          });
        }
      }

      if (studioId) {
        try {
          await acceptCurrentMemberLegalCompliance(studioId);
        } catch (studioErr) {
          console.warn("[legal-compliance] studio compliance recording notice:", studioErr);
        }
      }

      if (typeof window !== "undefined") {
        if (currentUser?.id) {
          localStorage.setItem(`photoos_user_${currentUser.id}_legal_accepted_v${LEGAL_CONFIG.version}`, "true");
        }
        localStorage.setItem("photoos_corporate_compliance_accepted", "true");
        if (studioId) {
          localStorage.setItem(`photoos_legal_accepted_${studioId}`, "true");
          localStorage.setItem(`photoos_legal_version_${studioId}`, LEGAL_CONFIG.version);
        }

        // Record compliance acceptance for corporate portal
        try {
          const raw = localStorage.getItem("photoos_corporate_company");
          if (raw) {
            const comp = JSON.parse(raw);
            comp.compliance_accepted = true;
            comp.compliance_accepted_at = new Date().toISOString();
            localStorage.setItem("photoos_corporate_company", JSON.stringify(comp));
          } else {
            localStorage.setItem(
              "photoos_corporate_company",
              JSON.stringify({
                id: "corp_enterprise",
                name: "Corporate Office",
                compliance_accepted: true,
                compliance_accepted_at: new Date().toISOString(),
                subscription: {
                  plan_name: "Corporate Enterprise (7-Day Trial)",
                  status: "trialing",
                  days_remaining: 7,
                },
              })
            );
          }
        } catch (corpErr) {
          console.warn("[legal-compliance] corporate compliance sync notice:", corpErr);
        }
      }

      let effectiveNext = nextPath;
      const searchParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
      const planParams = new URLSearchParams();
      for (const key of ["planId", "planCode", "billingCycle", "mode"]) {
        const val = searchParams.get(key);
        if (val) planParams.set(key, val);
      }
      const qs = planParams.toString();
      const planSuffix = qs ? `?${qs}` : "";

      if (!effectiveNext || effectiveNext.startsWith("/legal-compliance")) {
        effectiveNext = isCorporateMode
          ? "/corporate/onboarding"
          : studioId
            ? "/dashboard"
            : `/onboarding/studio${planSuffix}`;
      } else if (isCorporateMode) {
        effectiveNext = nextPath.includes("corporate") ? nextPath : "/corporate/onboarding";
      } else if (!studioId && !nextPath.includes("/onboarding/studio")) {
        effectiveNext = `/onboarding/studio${planSuffix}`;
      }

      router.replace(
        effectiveNext,
      );

    } catch (
      acceptanceError
    ) {

      console.error(
        "LEGAL COMPLIANCE ACCEPTANCE ERROR:",
        acceptanceError,
      );


      setError(
        acceptanceError instanceof Error
          ? acceptanceError.message
          : language === "mr"
            ? "तुमची स्वीकृती जतन करता आली नाही. कृपया पुन्हा प्रयत्न करा."
            : "Unable to save your acceptance. Please try again.",
      );

      setState(
        "ready",
      );

    }

  }


  if (
    state ===
    "loading"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-6">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0A3F61] shadow-2xl shadow-[#0A3F61]/20">

            <Loader2 className="h-7 w-7 animate-spin text-white" />

          </div>

          <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
            Preparing your workspace
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Checking your access requirements...
          </p>

        </div>

      </main>
    );

  }


  if (
    state ===
    "error"
  ) {

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F7FA] px-5">

        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-sky-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-indigo-100/60 blur-3xl" />

        <section className="relative w-full max-w-md rounded-[32px] border border-slate-200/80 bg-white p-8 text-center shadow-[0_30px_100px_-35px_rgba(15,23,42,0.3)] sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-600">

            <ShieldCheck className="h-8 w-8" />

          </div>

          <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
            Unable to verify access
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 h-12 w-full rounded-2xl bg-[#0A3F61] px-5 text-sm font-bold text-white shadow-xl shadow-[#0A3F61]/20 transition hover:bg-[#083653]"
          >
            Try Again
          </button>

        </section>

      </main>
    );

  }


  return (
    <main
      lang={language}
      className="relative min-h-screen overflow-hidden bg-[#F4F7FA]"
    >

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-[14%] -top-[18%] h-[700px] w-[700px] rounded-full bg-sky-100/70 blur-3xl" />

        <div className="absolute -right-[14%] top-[4%] h-[650px] w-[650px] rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute bottom-[-30%] left-[28%] h-[620px] w-[620px] rounded-full bg-indigo-100/50 blur-3xl" />

      </div>


      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-2xl">

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <div className="flex items-center gap-3">

            <div className="relative flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#0A3F61] shadow-lg shadow-[#0A3F61]/20">

              <Sparkles className="h-5 w-5 text-white" />

              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-white" />

            </div>

            <div>

              <p className="text-[15px] font-black tracking-tight text-slate-950">
                PhotoOS
              </p>

              <p className="text-[11px] font-medium text-slate-500">
                Workspace access
              </p>

            </div>

          </div>


          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 sm:flex">

            <LockKeyhole className="h-3.5 w-3.5" />

            {ui.securePrivate}

          </div>

        </div>

      </header>


      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="relative mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:py-16">


        {/* =======================================================
            HERO
        ======================================================= */}

        <section className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#0A3F61]/10 bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0A3F61] shadow-sm">

            <ShieldCheck className="h-4 w-4" />

            {ui.finalStep}

          </div>


          <h1 className="mt-7 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">

            {language === "mr"
              ? "तुमचे"
              : "Review your"}
            <span className="block text-[#0A3F61]">
              {language === "mr"
                ? "PhotoOS कायदेशीर करार"
                : "PhotoOS agreements"}
            </span>

          </h1>


          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">

            {ui.reviewDescription}

          </p>


          {/* =====================================================
              LANGUAGE SELECTOR
          ===================================================== */}

          <div className="mx-auto mt-7 inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">

            <span className="px-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
              {ui.language}
            </span>

            {LEGAL_LANGUAGE_OPTIONS.map(
              (option) => {

                const active =
                  language ===
                  option.code;

                return (
                  <button
                    key={option.code}
                    type="button"
                    disabled={
                      languageLoading ||
                      state === "accepting"
                    }
                    onClick={() =>
                      loadAgreementsForLanguage(
                        option.code,
                      )
                    }
                    className={`min-w-[92px] rounded-xl px-4 py-2.5 text-xs font-black transition ${
                      active
                        ? "bg-[#0A3F61] text-white shadow-md shadow-[#0A3F61]/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#0A3F61]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {option.nativeLabel}
                  </button>
                );

              },
            )}

          </div>


          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            {ui.languageHint}
          </p>

        </section>


        {/* =======================================================
            PROGRESS
        ======================================================= */}

        <section className="mx-auto mt-10 max-w-4xl">

          <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61]/10 text-[#0A3F61]">

                  {allReviewed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <FileCheck2 className="h-5 w-5" />
                  )}

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-900">
                    {ui.agreementReview}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">

                    {reviewedCount} of {totalAgreements} {ui.documentsReviewed}

                  </p>

                </div>

              </div>


              <div className="text-right">

                <span
                  className={`text-sm font-black ${
                    allReviewed
                      ? "text-emerald-600"
                      : "text-[#0A3F61]"
                  }`}
                >
                  {progress}%
                </span>

              </div>

            </div>


            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-[#0A3F61] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>


            <div className="mt-4 flex gap-2">

              {agreements.map(
                (
                  agreement,
                  index,
                ) => {

                  const isReviewed =
                    reviewed.has(
                      agreement.id,
                    );

                  return (
                    <button
                      key={agreement.id}
                      type="button"
                      onClick={() =>
                        scrollToAgreement(
                          index,
                        )
                      }
                      className={`group flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                        isReviewed
                          ? "border-emerald-100 bg-emerald-50/70"
                          : "border-slate-100 bg-slate-50 hover:border-[#0A3F61]/20 hover:bg-white"
                      }`}
                    >

                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          isReviewed
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >

                        {isReviewed ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-black">
                            0{index + 1}
                          </span>
                        )}

                      </div>

                      <span className="truncate text-[11px] font-bold text-slate-700 sm:text-xs">

                        {
                          getAgreementMeta(
                            agreement.agreement_type,
                          ).shortLabel
                        }

                      </span>

                    </button>
                  );

                },
              )}

            </div>

          </div>

        </section>


        {/* =======================================================
            MAIN GRID
        ======================================================= */}

        <div className="mx-auto mt-8 grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">


          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-5">


            {/* Highlights */}

            <section className="grid gap-3 sm:grid-cols-3">

              {HIGHLIGHTS.map(
                (item) => (

                  <div
                    key={item.number}
                    className="rounded-[22px] border border-white/80 bg-white/75 p-5 shadow-[0_15px_50px_-35px_rgba(15,23,42,0.3)] backdrop-blur-xl"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] font-black tracking-[0.16em] text-[#0A3F61]">
                        {item.number}
                      </span>

                      <FileText className="h-4 w-4 text-slate-300" />

                    </div>

                    <p className="mt-4 text-sm font-black text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>

                  </div>

                ),
              )}

            </section>


            {/* Agreements */}

            {agreements.map(
              (
                agreement,
                index,
              ) => {

                const meta =
                  getAgreementMeta(
                    agreement.agreement_type,
                  );

                const isReviewed =
                  reviewed.has(
                    agreement.id,
                  );

                return (

                  <section
                    key={agreement.id}
                    className={`overflow-hidden rounded-[30px] border bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.28)] transition ${
                      isReviewed
                        ? "border-emerald-100"
                        : "border-slate-200/80"
                    }`}
                  >

                    {/* Agreement header */}

                    <div className="border-b border-slate-100 px-6 py-6 sm:px-8">

                      <div className="flex items-start gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] ${
                            isReviewed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-[#0A3F61]/10 text-[#0A3F61]"
                          }`}
                        >

                          {isReviewed ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <FileCheck2 className="h-6 w-6" />
                          )}

                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-[#0A3F61]/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0A3F61]">

                              0{index + 1}

                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">

                              Required

                            </span>

                          </div>


                          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">

                            {agreement.title ||
                              meta.label}

                          </h2>


                          <p className="mt-1 text-sm leading-6 text-slate-500">

                            {meta.description}

                          </p>


                          <div className="mt-4 flex flex-wrap items-center gap-2">

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600">

                              Version {agreement.version}

                            </span>

                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">

                              Currently active

                            </span>

                            <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700">

                              {language === "mr" ? `प्रभावी दिनांक: ${LEGAL_CONFIG.effectiveDateFormattedMr}` : `Effective from ${LEGAL_CONFIG.effectiveDateFormattedEn}`}

                            </span>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* Document */}

                    <div className="px-6 py-6 sm:px-8 sm:py-7">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-sm font-black text-slate-950">
                            Full document
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Review the complete document before continuing.
                          </p>

                        </div>


                        {isReviewed ? (

                          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 sm:flex">

                            <CheckCircle2 className="h-3.5 w-3.5" />

                            Reviewed

                          </span>

                        ) : (

                          <span className="hidden shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700 sm:block">

                            Review required

                          </span>

                        )}

                      </div>


                      <div className="relative mt-5">

                        <div
                          ref={(element) => {
                            agreementRefs.current[
                              index
                            ] = element;
                          }}
                          onScroll={() =>
                            handleAgreementScroll(
                              agreement,
                              index,
                            )
                          }
                          className="legal-agreement-scroll h-[360px] overflow-y-auto rounded-[22px] border border-slate-200 bg-[#FAFBFC] p-5 pr-8 shadow-inner sm:h-[430px] sm:p-7 sm:pr-10"
                        >

                          {agreement.content_markdown ? (

                            <div className="min-h-[calc(100%+120px)] whitespace-pre-wrap pb-24 text-[13px] leading-7 text-slate-700 sm:text-sm">

                              {agreement.content_markdown}

                            </div>

                          ) : (

                            <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-500">

                              <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />

                              Loading document...

                            </div>

                          )}

                        </div>


                        {!isReviewed && agreement.content_markdown && (
                          <>
                            <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
                              <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-2 text-[11px] font-bold text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A3F61]/10 text-[#0A3F61]">
                                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                                </span>

                                <span>{ui.scrollToReview}</span>
                              </div>
                            </div>


                            <div className="pointer-events-none absolute right-2 top-3 bottom-3 z-10 flex w-1.5 items-start">
                              <div className="h-full w-1.5 rounded-full bg-slate-200/80">
                                <div className="h-1/3 min-h-12 w-full rounded-full bg-[#0A3F61]/75 shadow-sm" />
                              </div>
                            </div>
                          </>
                        )}

                      </div>


                      <div
                        className={`mt-3 flex items-center justify-center gap-2 text-xs font-bold ${
                          isReviewed
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >

                        {isReviewed ? (

                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Document reviewed
                          </>

                        ) : (

                          <>
                            <ChevronRight className="h-4 w-4" />
                            Scroll to the end to mark as reviewed
                          </>

                        )}

                      </div>

                    </div>

                  </section>

                );

              },
            )}

          </div>


          {/* =====================================================
              RIGHT ACCEPTANCE PANEL
          ===================================================== */}

          <aside className="lg:sticky lg:top-[100px] lg:h-fit">

            <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.35)]">


              {/* Panel hero */}

              <div className="relative overflow-hidden bg-[#0A3F61] px-6 py-7 text-white sm:px-7">

                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-sky-300/10 blur-2xl" />


                <div className="relative">

                  <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-white/10 ring-1 ring-white/10">

                    <ShieldCheck className="h-6 w-6" />

                  </div>


                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
                    Workspace unlock
                  </p>


                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Almost there.
                  </h2>


                  <p className="mt-3 text-sm leading-6 text-white/70">

                    Review all three documents and confirm once to unlock your PhotoOS workspace.

                  </p>

                </div>

              </div>


              <div className="p-6 sm:p-7">


                {/* Review status */}

                <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-black text-slate-900">
                        Review progress
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {reviewedCount} of {totalAgreements}{" "}
                        {language === "mr"
                          ? "कागदपत्रांचे पुनरावलोकन पूर्ण"
                          : "documents reviewed"}
                      </p>

                    </div>


                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        allReviewed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-white text-[#0A3F61] ring-1 ring-slate-200"
                      }`}
                    >

                      {allReviewed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-xs font-black">
                          {reviewedCount}/{totalAgreements}
                        </span>
                      )}

                    </div>

                  </div>


                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-[#0A3F61] transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Agreement checklist */}

                <div className="mt-5 space-y-2">

                  {agreements.map(
                    (
                      agreement,
                      index,
                    ) => {

                      const isReviewed =
                        reviewed.has(
                          agreement.id,
                        );

                      const meta =
                        getAgreementMeta(
                          agreement.agreement_type,
                        );

                      return (

                        <button
                          key={agreement.id}
                          type="button"
                          onClick={() =>
                            scrollToAgreement(
                              index,
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            isReviewed
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                          }`}
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isReviewed
                                ? "bg-emerald-500 text-white"
                                : "bg-white text-slate-400 ring-1 ring-slate-200"
                            }`}
                          >

                            {isReviewed ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}

                          </div>


                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-black text-slate-900">
                              {meta.label}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                              Version {agreement.version}
                            </p>

                          </div>


                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />

                        </button>

                      );

                    },
                  )}

                </div>


                {/* Confirmation */}

                <label
                  className={`mt-5 flex gap-3 rounded-[22px] border p-4 transition ${
                    !allReviewed
                      ? "cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-70"
                      : accepted
                        ? "cursor-pointer border-[#0A3F61]/20 bg-[#0A3F61]/5"
                        : "cursor-pointer border-slate-200 bg-slate-50 hover:border-[#0A3F61]/30"
                  }`}
                >

                  <input
                    type="checkbox"
                    checked={accepted}
                    disabled={
                      !allReviewed ||
                      state ===
                        "accepting"
                    }
                    onChange={(
                      event,
                    ) => {

                      setAccepted(
                        event.target.checked,
                      );

                      setError(
                        null,
                      );

                    }}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-[#0A3F61] focus:ring-[#0A3F61]"
                  />


                  <span className="text-[13px] leading-6 text-slate-700">

                    {ui.finalConfirmation}

                  </span>

                </label>


                {/* Error */}

                {error && (

                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">

                    {error}

                  </div>

                )}


                {/* CTA */}

                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={
                    !allReviewed ||
                    !accepted ||
                    state ===
                      "accepting"
                  }
                  className="group mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0A3F61] px-5 text-sm font-black text-white shadow-xl shadow-[#0A3F61]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#083653] hover:shadow-2xl hover:shadow-[#0A3F61]/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >

                  {state ===
                  "accepting" ? (

                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving acceptance...
                    </>

                  ) : (

                    <>
                      Accept & Enter Workspace
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>

                  )}

                </button>


                {/* Trust note */}

                <div className="mt-6 border-t border-slate-100 pt-5">

                  <div className="flex gap-3">

                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <p className="text-[11px] leading-5 text-slate-400">

                      {language === "mr"
                        ? "तुमची स्वीकृती तुमच्या authenticated workspace membership आणि प्रत्येक वर्तमान agreement version विरुद्ध नोंदवली जाते."
                        : "Your acceptance is recorded against your authenticated workspace membership and each current agreement version."}

                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* Protection card */}

            <div className="mt-4 rounded-[22px] border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                  <CheckCircle2 className="h-4 w-4" />

                </div>

                <div>

                  <p className="text-xs font-black text-slate-900">
                    {language === "mr"
                      ? "Workspace संरक्षण सक्रिय आहे"
                      : "Workspace protection enabled"}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">

                    {language === "mr"
                      ? "Compliance पडताळले जाईपर्यंत Dashboard access संरक्षित राहील."
                      : "Dashboard access remains protected until compliance is verified."}

                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* =======================================================
            FOOTER
        ======================================================= */}

        <footer className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-[11px] text-slate-400 sm:flex-row">

          <p>
            © {new Date().getFullYear()} PhotoOS
          </p>

          <div className="flex items-center gap-2">

            <LockKeyhole className="h-3.5 w-3.5" />

            Secure workspace access

          </div>

        </footer>

      </div>

    </main>
  );
}
