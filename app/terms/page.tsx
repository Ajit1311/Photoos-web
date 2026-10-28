import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { LEGAL_CONFIG } from "@/config/legal";
import { TERMS_CONTENT } from "@/lib/legal/raw-content";

export const metadata: Metadata = {
  title: `Terms of Service (v${LEGAL_CONFIG.version}) | PhotoOS`,
  description: "Official Terms of Service and Studio Master Agreement for PhotoOS.",
};

export default function TermsPage() {
  return (
    <LegalDocumentViewer
      documentType="terms_of_service"
      contentEn={TERMS_CONTENT.en}
      contentMr={TERMS_CONTENT.mr}
    />
  );
}
