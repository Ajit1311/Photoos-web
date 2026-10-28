"use client";

import AiWorkspace from "@/components/ai/AiWorkspace";
import PlanFeatureGate from "@/components/subscription/PlanFeatureGate";
import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

export default function AiPage() {
  const {
    data: bootstrap,
  } =
    useBootstrapContext();

  const workspaceId =
    bootstrap
      ?.workspace
      ?.studio
      ?.id;

  return (
    <PlanFeatureGate
      feature="ai_features"
      title="Advanced AI Features Locked"
      description="Advanced AI processing, automated culling, and smart photo enhancement require Studio Pro (Business Booster) or Business Elite. Upgrade your subscription to unlock."
    >
      <AiWorkspace
        workspaceId={
          workspaceId ??
          undefined
        }
      />
    </PlanFeatureGate>
  );
}
