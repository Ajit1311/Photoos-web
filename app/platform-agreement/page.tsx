import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { LEGAL_CONFIG } from "@/config/legal";
import { PLATFORM_AGREEMENT_CONTENT } from "@/lib/legal/raw-content";

export const metadata: Metadata = {
  title: `Platform Agreement (v${LEGAL_CONFIG.version}) | PhotoOS`,
  description: "Tripartite Platform Agreement between PhotoOS, Photographers, and Clients under IT Act 2000 Section 79.",
};

export default function PlatformAgreementPage() {
  return (
    <LegalDocumentViewer
      documentType="platform_agreement"
      contentEn={PLATFORM_AGREEMENT_CONTENT.en}
      contentMr={PLATFORM_AGREEMENT_CONTENT.mr}
    />
  );
}
