"use client";

import AiWorkspace from "@/components/ai/AiWorkspace";

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
    <AiWorkspace
      workspaceId={
        workspaceId ??
        undefined
      }
    />
  );
}
