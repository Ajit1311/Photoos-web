"use client";

import Link from "next/link";

import { useProjectsContext } from "@/context/ProjectsContext";
// Added Bootstrap Context Import
import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

export default function ProjectsPage() {
  // Added Bootstrap Context State
  const {
    data: bootstrap,
  } = useBootstrapContext();

  // Added console.log
  console.log(
    bootstrap,
  );

  const {
    data,
    loading,
    error,
    reload,
  } = useProjectsContext();

  if (loading) {

    return (

      <main className="flex items-center justify-center py-20">

        <p className="text-slate-500">

          Loading projects...

        </p>

      </main>

    );

  }

  if (error) {

    return (

      <main className="space-y-6 p-8">

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

          <h2 className="text-lg font-semibold text-red-700">

            Failed to load projects

          </h2>

          <p className="mt-2 text-sm text-red-600">

            {error.message}

          </p>

          <button
            onClick={reload}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
          >

            Retry

          </button>

        </div>

      </main>

    );

  }

  const projects =
    data?.projects ?? [];

  return (

    <main className="space-y-8 p-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">

            Projects

          </h1>

          <p className="mt-2 text-slate-500">

            Total Projects: {projects.length}

          </p>

        </div>

        <Link
          href="/dashboard/projects/create"
          className="rounded-xl bg-[#0A3F61] px-5 py-3 font-medium text-white transition hover:opacity-90"
        >

          New Project

        </Link>

      </div>

      {projects.length === 0 ? (

        <div className="rounded-2xl border border-dashed p-16 text-center">

          <h2 className="text-xl font-semibold">

            No Projects Found

          </h2>

          <p className="mt-3 text-slate-500">

            Create your first project to get started.

          </p>

        </div>

      ) : (

        <div className="grid gap-5">

          {projects.map((project) => (

            <div
              key={project.id}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-semibold">

                    {project.title}

                  </h2>

                  <p className="mt-2 text-sm text-slate-500">

                    {project.description ??
                      "No description"}

                  </p>

                  {project.event_type && (

                    <p className="mt-2 text-xs text-slate-400">

                      {project.event_type}

                    </p>

                  )}

                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">

                  {project.status}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>

  );
}