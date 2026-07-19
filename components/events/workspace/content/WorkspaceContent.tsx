"use client";

import GalleryWorkspace from "../gallery/GalleryWorkspace";
import OverviewDashboard from "../overview/OverviewDashboard";
// WorkspaceTab टाईप इथून इम्पोर्ट केला आहे
import type { WorkspaceTab } from "@/types/events/workspace"; 

// activeTab चा टाईप `string` वरून `WorkspaceTab` केला आहे
export interface WorkspaceContentProps {
  activeTab: WorkspaceTab; 
}

export default function WorkspaceContent({
  activeTab,
}: WorkspaceContentProps) {
  switch (activeTab) {
    case "overview":
      return <OverviewDashboard />;

    case "gallery":
      return <GalleryWorkspace />;

    case "payments":
      return (
        <ComingSoon
          title="Payment Transactions"
          description="Payment ledger, invoices and transaction history will appear here."
        />
      );

    case "delivery":
      return (
        <ComingSoon
          title="Delivery"
          description="Gallery publishing, QR sharing and delivery tools will appear here."
        />
      );

    case "chat":
      return (
        <ComingSoon
          title="Chat"
          description="Internal team chat and client conversations will appear here."
        />
      );

    case "reminder":
      return (
        <ComingSoon
          title="Reminder"
          description="WhatsApp, Email and SMS reminders will appear here."
        />
      );

    case "settings":
      return (
        <ComingSoon
          title="Settings"
          description="Gallery settings, permissions and watermark configuration."
        />
      );

    default:
      return <OverviewDashboard />;
  }
}

interface ComingSoonProps {
  title: string;
  description: string;
}

function ComingSoon({
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}