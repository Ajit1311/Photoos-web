"use client";

import {
  useParams,
} from "next/navigation";

import {
  ProjectHeader,
} from "@/components/projects/details/ProjectHeader";

import {
  useProject,
} from "@/hooks/useProject";

import {
  ProjectFinancialCard,
} from "@/components/projects/details/ProjectFinancialCard";

import {
  ProjectInformationCard,
} from "@/components/projects/details/ProjectInformationCard";

import {
  ProjectClientCard,
} from "@/components/projects/details/ProjectClientCard";

import {
  ProjectManagerCard,
} from "@/components/projects/details/ProjectManagerCard";

import {
  ProjectSummaryCard,
} from "@/components/projects/details/ProjectSummaryCard";

import {
  ProjectQuickActionsCard,
} from "@/components/projects/details/ProjectQuickActionsCard";

export default function ProjectDetailsPage() {

  const params = useParams();

  const projectId =
    params.projectId as string;

  const {
    project,
    loading,
    refreshing,
    error,
  } = useProject(projectId);

  if (loading) {

    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-semibold">
            Loading Project
          </h1>

          <p className="mt-2 text-slate-500">
            Loading project data...
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Project ID: {projectId}
          </p>

        </div>

      </main>
    );

  }

  if (error) {

    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

          <h1 className="text-2xl font-semibold text-red-700">
            Unable to Load Project
          </h1>

          <p className="mt-3 text-red-600">
            {error.message}
          </p>

          <pre className="mt-6 overflow-auto rounded-xl bg-white p-4 text-xs text-slate-700">
            {JSON.stringify(error, null, 2)}
          </pre>

          <p className="mt-6 text-xs text-slate-500">
            Project ID: {projectId}
          </p>

        </div>

      </main>
    );

  }

  if (!project) {

    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">

          <h1 className="text-2xl font-semibold text-amber-700">
            Project Data Not Found
          </h1>

          <p className="mt-3 text-amber-700">
            The project request completed but no project object
            was returned.
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Project ID: {projectId}
          </p>

        </div>

      </main>
    );

  }

  return (

    <div className="space-y-6">

      {refreshing && (
        <div className="text-xs text-slate-400">
          Refreshing project...
        </div>
      )}

      <ProjectHeader
        project={project}
      />

      <ProjectFinancialCard
        project={project}
      />

      <ProjectInformationCard
        project={project}
      />

      <ProjectClientCard
        clientId={project.client_id}
      />

      <ProjectManagerCard
        managerId={
          project.project_manager_id
        }
      />

      <ProjectSummaryCard
        project={project}
      />

      <ProjectQuickActionsCard
        projectId={project.id}
        clientId={project.client_id}
      />

    </div>

  );

}
