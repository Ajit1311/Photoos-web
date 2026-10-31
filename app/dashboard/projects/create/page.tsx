"use client";

import {
  Suspense,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ProjectForm,
} from "@/components/forms/ProjectForm";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  useClients,
} from "@/hooks/useClients";

function CreateProjectContent() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const clientId =
    searchParams.get("clientId") ?? "";

  const {
    studioId,
  } = useStudioId();

  const {
    data: bootstrap,
  } =
    useBootstrapContext();

  const {
    clients,
    loading: clientsLoading,
  } =
    useClients();

  const selectedClient =
    clients.find(
      (client) =>
        client.id === clientId,
    );

  return (

    <main className="mx-auto max-w-5xl p-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Create Project
        </h1>

        <p className="mt-2 text-slate-500">
          Create a new studio project.
        </p>

        {selectedClient && (

          <p className="mt-2 text-sm text-slate-600">

            Client:{" "}

            <span className="font-medium">

              {selectedClient.display_name}

            </span>

          </p>

        )}

      </div>

      <ProjectForm

        studioId={studioId ?? ""}

        clients={clients}

        loadingClients={clientsLoading}

        initialValues={{
          client_id: clientId,
        }}

        onSuccess={() => {

          if (clientId) {

            router.push(
              `/dashboard/clients/${clientId}`,
            );

            return;

          }

          router.push(
            "/dashboard/projects",
          );

        }}

        onCancel={() => {

          router.back();

        }}

      />

    </main>

  );

}

function CreateProjectLoading() {

  return (

    <main className="mx-auto max-w-5xl p-8">

      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <p className="text-slate-500">
          Loading project form...
        </p>

      </div>

    </main>

  );

}

export default function CreateProjectPage() {

  return (

    <Suspense
      fallback={
        <CreateProjectLoading />
      }
    >

      <CreateProjectContent />

    </Suspense>

  );

}