"use client";

import {
  MarketingWorkspace,
} from "@/components/marketing/MarketingWorkspace";
import PlanFeatureGate from "@/components/subscription/PlanFeatureGate";

export default function MarketingPage() {
  return (
    <PlanFeatureGate
      feature="marketing"
      title="Marketing & Automation Locked"
      description="Client acquisition campaigns, lead capture workflows, and promotional automations require Studio Starter or higher."
    >
      <MarketingWorkspace />
    </PlanFeatureGate>
  );
}
