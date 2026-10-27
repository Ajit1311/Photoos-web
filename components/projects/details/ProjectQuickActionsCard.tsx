"use client";

import Link from "next/link";

import {
  ArrowRight,
  ClipboardCopy,
  FolderOpen,
  Pencil,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

type ProjectQuickActionsCardProps = {
  projectId: string;
  clientId: string;
};

export function ProjectQuickActionsCard({
  projectId,
  clientId,
}: ProjectQuickActionsCardProps) {

  async function copyProjectId() {

    await navigator.clipboard.writeText(
      projectId,
    );

  }

  async function copyClientId() {

    await navigator.clipboard.writeText(
      clientId,
    );

  }

  return (

    <div className="rounded-xl border bg-background p-6 shadow-sm">

      <h2 className="mb-6 text-lg font-semibold">
        Quick Actions
      </h2>

      <div className="grid gap-3 md:grid-cols-2">

        <Link
          href={`/dashboard/projects/${projectId}/edit`}
        >
          <Button
            className="w-full justify-between"
          >
            Edit Project

            <Pencil className="h-4 w-4" />

          </Button>
        </Link>

        <Link
          href={`/dashboard/clients/${clientId}`}
        >
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            Open Client

            <ArrowRight className="h-4 w-4" />

          </Button>
        </Link>

        <Button
          variant="outline"
          className="justify-between"
          onClick={copyProjectId}
        >

          Copy Project ID

          <ClipboardCopy className="h-4 w-4" />

        </Button>

        <Button
          variant="outline"
          className="justify-between"
          onClick={copyClientId}
        >

          Copy Client ID

          <ClipboardCopy className="h-4 w-4" />

        </Button>

        <Button
          variant="outline"
          disabled
          className="justify-between"
        >

          Project Files

          <FolderOpen className="h-4 w-4" />

        </Button>

      </div>

    </div>

  );

}