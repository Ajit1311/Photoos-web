import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { LEGAL_CONFIG } from "@/config/legal";
import { PRIVACY_CONTENT } from "@/lib/legal/raw-content";

export const metadata: Metadata = {
  title: `Privacy Policy & DPDP Notice (v${LEGAL_CONFIG.version}) | PhotoOS`,
  description: "PhotoOS Privacy Policy in compliance with India's Digital Personal Data Protection (DPDP) Act 2023.",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentViewer
      documentType="privacy_policy"
      contentEn={PRIVACY_CONTENT.en}
      contentMr={PRIVACY_CONTENT.mr}
    />
  );
}
