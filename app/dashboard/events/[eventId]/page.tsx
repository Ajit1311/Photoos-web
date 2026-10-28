"use client";

import {
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import WorkspaceLayout from "@/components/events/workspace/layout/WorkspaceLayout";

import WorkspaceHeader from "@/components/events/workspace/header/WorkspaceHeader";

import WorkspaceTabs from "@/components/events/workspace/tabs/WorkspaceTabs";

import WorkspaceContent from "@/components/events/workspace/content/WorkspaceContent";

import WorkspaceSkeleton from "@/components/events/workspace/loading/WorkspaceSkeleton";

import WorkspaceError from "@/components/events/workspace/error/WorkspaceError";

import WorkspaceEmpty from "@/components/events/workspace/empty/WorkspaceEmpty";

import {
  useWorkspace,
} from "@/hooks/events/useWorkspace";

import type {
  WorkspaceTab,
} from "@/types/events/workspace";


function getStringValue(
  value:
    unknown,
): string | null {

  if (
    typeof value !==
    "string"
  ) {

    return null;

  }


  const trimmed =
    value.trim();


  return trimmed.length >
    0
    ? trimmed
    : null;

}


export default function EventWorkspacePage() {

  const params =
    useParams();


  const eventId =
    typeof params.eventId ===
    "string"
      ? params.eventId
      : "";


  const {
    loading,
    workspace,
    error,
    refresh,
  } =
    useWorkspace(
      eventId,
    );


  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      WorkspaceTab
    >(
      "overview",
    );


  if (
    loading
  ) {

    return (
      <WorkspaceSkeleton />
    );

  }


  if (
    error
  ) {

    return (
      <WorkspaceError
        error={
          error
        }
        onRetry={
          refresh
        }
      />
    );

  }


  if (
    !workspace
  ) {

    return (
      <WorkspaceEmpty />
    );

  }


  const workspaceId =
    getStringValue(
      workspace.event.workspaceId,
    ) ?? eventId;


  const clientId =
    getStringValue(
      workspace.client?.id,
    );


  return (

    <WorkspaceLayout>

      <WorkspaceHeader
        workspace={
          workspace.event
        }
      />


      <WorkspaceTabs
        activeTab={
          activeTab
        }
        onTabChange={
          setActiveTab
        }
      />


      <div className="flex-1 p-6">

        <WorkspaceContent
          activeTab={
            activeTab
          }
          eventId={
            eventId
          }
          clientId={
            clientId
          }
          workspaceId={
            workspaceId
          }
        />

      </div>

    </WorkspaceLayout>

  );

}
