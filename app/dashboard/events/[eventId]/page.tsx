"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import WorkspaceLayout from "@/components/events/workspace/layout/WorkspaceLayout";
import WorkspaceHeader from "@/components/events/workspace/header/WorkspaceHeader";
import WorkspaceTabs from "@/components/events/workspace/tabs/WorkspaceTabs";
import WorkspaceContent from "@/components/events/workspace/content/WorkspaceContent";

import { useWorkspace } from "@/hooks/events/useWorkspace";
import type { WorkspaceTab } from "@/types/events/workspace";
export default function EventWorkspacePage() {
  const params = useParams();

  const eventId = params.eventId as string;

  const { loading } = useWorkspace(eventId);

const [activeTab, setActiveTab] =
  useState<WorkspaceTab>("overview");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Workspace...
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <WorkspaceHeader />

      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 p-6">
        <WorkspaceContent activeTab={activeTab} />
      </div>
    </WorkspaceLayout>
  );
}