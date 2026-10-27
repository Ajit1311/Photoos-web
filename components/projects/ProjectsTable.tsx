"use client";

import Link from "next/link";

import type { GetProjectsResponse } from "@/types/api/project";

type ProjectsTableProps = {
  projects: GetProjectsResponse["projects"];
};

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#3495A1]/35 bg-gradient-to-br from-[#F7FAFC] to-[#3495A1]/[0.06] p-10 text-center sm:p-16">
        <h2 className="text-xl font-bold tracking-tight text-[#0A3F61]">No Projects Found</h2>
        <p className="mt-3 text-sm text-slate-500">
          Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#0A3F61]/10 bg-white shadow-[0_8px_30px_rgba(10,63,97,0.06)]"><div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gradient-to-r from-[#0A3F61]/[0.07] via-[#1F70B8]/[0.06] to-[#3495A1]/[0.10]">
          <tr>
            <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#0A3F61]">
              Project
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Event Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Status
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-t border-[#0A3F61]/[0.07] transition-colors hover:bg-[#3495A1]/[0.045]"
            >
              <td className="whitespace-nowrap px-6 py-5">
                <div>
                  <p className="font-semibold text-[#0A3F61]">
                    {project.title}
                  </p>
                  <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">
                    {project.description ?? "No description"}
                  </p>
                </div>
              </td>

              <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">
                {project.event_type ?? "-"}
              </td>

              <td className="px-6 py-5">
                <span className="inline-flex rounded-full border border-[#1F70B8]/15 bg-gradient-to-r from-[#1F70B8]/[0.10] to-[#3495A1]/[0.12] px-3 py-1 text-xs font-bold capitalize text-[#0A3F61]">
                  {project.status}
                </span>
              </td>

              <td className="px-6 py-5">
                <div className="flex min-w-max justify-end gap-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="rounded-lg border border-[#0A3F61]/15 bg-white px-3 py-2 text-sm font-semibold text-[#0A3F61] transition hover:border-[#3495A1]/40 hover:bg-[#F7FAFC]"
                  >
                    View
                  </Link>

                  <Link
                    href={`/dashboard/projects/${project.id}/edit`}
                    className="rounded-lg bg-gradient-to-r from-[#0A3F61] to-[#1F70B8] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/dashboard/projects/${project.id}/events/new`}
                    className="rounded-lg bg-gradient-to-r from-[#EF8619] to-[#EF8619]/85 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Create Event
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}