"use client";

import {
  CalendarDays,
  FolderKanban,
  Hash,
  UserCircle,
} from "lucide-react";

import { format } from "date-fns";

import type {
  ProjectDto,
} from "@/types/api/project";

type ProjectSummaryCardProps = {
  project: ProjectDto;
};

type SummaryItemProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

function SummaryItem({
  icon,
  label,
  value,
}: SummaryItemProps) {

  return (

    <div className="flex items-start gap-3 rounded-lg border p-4">

      <div className="mt-1 text-muted-foreground">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 font-medium break-all">
          {value}
        </p>

      </div>

    </div>

  );

}

export function ProjectSummaryCard({
  project,
}: ProjectSummaryCardProps) {

  return (

    <div className="rounded-xl border bg-background p-6 shadow-sm">

      <h2 className="mb-6 text-lg font-semibold">
        Project Summary
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <SummaryItem
          icon={
            <Hash className="h-5 w-5" />
          }
          label="Project ID"
          value={project.id}
        />

        <SummaryItem
          icon={
            <FolderKanban className="h-5 w-5" />
          }
          label="Status"
          value={project.status}
        />

        <SummaryItem
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Created"
          value={format(
            new Date(project.created_at),
            "dd MMM yyyy",
          )}
        />

        <SummaryItem
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Updated"
          value={format(
            new Date(project.updated_at),
            "dd MMM yyyy",
          )}
        />

        <SummaryItem
          icon={
            <UserCircle className="h-5 w-5" />
          }
          label="Client ID"
          value={project.client_id}
        />

        <SummaryItem
          icon={
            <UserCircle className="h-5 w-5" />
          }
          label="Project Manager"
          value={
            project.project_manager_id ??
            "-"
          }
        />

      </div>

    </div>

  );

}