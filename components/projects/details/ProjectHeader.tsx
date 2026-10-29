"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Home,
  Pencil,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { ProjectDto } from "@/types/api/project";

type ProjectHeaderProps = {
  project: ProjectDto;
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  // 1. Date Formatting Variables
  const formattedEventDate = project.event_date
    ? format(new Date(project.event_date), "dd MMM yyyy")
    : "-";

  const formattedCreatedAt = format(
    new Date(project.created_at),
    "dd MMM yyyy"
  );

  const formattedUpdatedAt = format(
    new Date(project.updated_at),
    "dd MMM yyyy"
  );

  return (
    <div className="space-y-6 rounded-xl border bg-background p-6 shadow-sm">
      {/* Breadcrumb Section */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />

        <ChevronRight className="h-4 w-4" />

        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>

        <ChevronRight className="h-4 w-4" />

        <Link href="/dashboard/projects" className="hover:text-foreground">
          Projects
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span className="font-medium text-foreground">{project.title}</span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="gap-2 px-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {project.title}
            </h1>

            {/* Status Badge below Title */}
            <div className="pt-2">
              <ProjectStatusBadge status={project.status} />
            </div>

            {project.description && (
              <p className="max-w-4xl leading-7 text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <Link href={`/dashboard/projects/${project.id}/edit`}>
          <Button size="default" className="gap-2 whitespace-nowrap">
            <Pencil className="h-4 w-4" />
            Edit Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Event Date:</span>
          <span className="font-medium text-foreground">
            {formattedEventDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>Event Type:</span>
          <span className="font-medium text-foreground">
            {project.event_type ?? "-"}
          </span>
        </div>
      </div>

      {/* Created At & Updated At Section */}
      <div className="border-t pt-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Created</span>
            {" : "}
            {formattedCreatedAt}
          </div>

          <div>
            <span className="font-medium text-foreground">Last Updated</span>
            {" : "}
            {formattedUpdatedAt}
          </div>
        </div>
      </div>
    </div>
  );
}