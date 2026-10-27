"use client";

import { format } from "date-fns";

import {
  CalendarDays,
  ClipboardList,
  FileText,
  StickyNote,
} from "lucide-react";

import type {
  ProjectDto,
} from "@/types/api/project";

type ProjectInformationCardProps = {
  project: ProjectDto;
};

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">

      <div className="mt-0.5 text-muted-foreground">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 font-medium">
          {value}
        </p>

      </div>

    </div>
  );
}

export function ProjectInformationCard({
  project,
}: ProjectInformationCardProps) {

  const formattedDate =
    project.event_date
      ? format(
          new Date(
            project.event_date,
          ),
          "dd MMM yyyy",
        )
      : "-";

  return (

    <div className="rounded-xl border bg-background p-6 shadow-sm">

      <h2 className="mb-6 text-lg font-semibold">
        Project Information
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        <InfoRow
          icon={
            <ClipboardList className="h-5 w-5" />
          }
          label="Project Status"
          value={project.status}
        />

        <InfoRow
          icon={
            <CalendarDays className="h-5 w-5" />
          }
          label="Event Date"
          value={formattedDate}
        />

        <InfoRow
          icon={
            <FileText className="h-5 w-5" />
          }
          label="Event Type"
          value={
            project.event_type ??
            "-"
          }
        />

        <InfoRow
          icon={
            <StickyNote className="h-5 w-5" />
          }
          label="Description"
          value={
            project.description ??
            "-"
          }
        />

      </div>

      <div className="mt-6 rounded-lg border p-4">

        <p className="text-sm text-muted-foreground">
          Internal Notes
        </p>

        <p className="mt-2 whitespace-pre-wrap">
          {project.notes ?? "-"}
        </p>

      </div>

    </div>

  );

}