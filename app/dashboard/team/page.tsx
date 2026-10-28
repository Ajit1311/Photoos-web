"use client";

import { TeamPage } from "@/components/team/TeamPage";
import PlanFeatureGate from "@/components/subscription/PlanFeatureGate";

export default function Page() {
  return (
    <PlanFeatureGate
      feature="team"
      title="Team Collaboration Locked"
      description="Multi-member team roles, associate photographer assignments, and crew permissions require Studio Pro (Business Booster) or Business Elite."
    >
      <TeamPage />
    </PlanFeatureGate>
  );
}
