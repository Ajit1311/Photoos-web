"use client";

import {
  useRouter,
  useParams,
} from "next/navigation";

import {
  ProjectForm,
} from "@/components/forms/ProjectForm";

import {
  useProject,
} from "@/hooks/useProject";

import {
  useClients,
} from "@/hooks/useClients";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useStudioId,
} from "@/hooks/useStudioId";

export default function EditProjectPage() {

  const router =
    useRouter();

  const params =
    useParams();

  const projectId =
    params.projectId as string;

  const {
    loading: bootstrapLoading,
  } =
    useBootstrapContext();

  const {
    studioId,
    bootstrapLoading:
      studioLoading,
  } =
    useStudioId();

  const {
    project,
    loading,
    error,
  } =
    useProject(
      projectId,
    );

  const {
    clients,
    loading:
      clientsLoading,
  } =
    useClients();

  if (
    bootstrapLoading ||
    studioLoading ||
    loading
  ) {
    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border bg-white p-8 shadow-sm">

          <h1 className="text-2xl font-semibold">
            Loading Project
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading project information...
          </p>

        </div>

      </main>
    );
  }

  if (
    error ||
    !project
  ) {
    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

          <h1 className="text-2xl font-semibold text-red-700">
            Unable to Load Project
          </h1>

          <p className="mt-3 text-red-600">
            {error?.message ??
              "Project not found."}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Project ID: {projectId}
          </p>

        </div>

      </main>
    );
  }

  if (!studioId) {
    return (
      <main className="mx-auto max-w-5xl p-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

          <h1 className="text-2xl font-semibold text-red-700">
            Studio Information Unavailable
          </h1>

          <p className="mt-3 text-red-600">
            Unable to determine the current studio.
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Edit Project
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update project information.
        </p>

      </div>

      <ProjectForm
        studioId={studioId}
        mode="edit"
        projectId={project.id}
        clients={clients}
        loadingClients={clientsLoading}
        initialValues={project}
        submitLabel="Update Project"
        onSuccess={() => {
          router.push(
            `/dashboard/projects/${project.id}`,
          );
        }}
        onCancel={() => {
          router.back();
        }}
      />

    </main>
  );
}
