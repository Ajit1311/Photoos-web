"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import { useBootstrapContext } from "@/context/BootstrapContext";
import ProjectsTable from "@/components/projects/ProjectsTable";
import { useDebounce } from "@/hooks/useDebounce";
import ProjectsPagination from "@/components/projects/ProjectsPagination";

export default function ProjectsPage() {
  const { data: bootstrap } = useBootstrapContext();

  console.log(bootstrap);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  // Reset to page 1 on search filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, loading, error, reload } = useProjects({
    page,
    search: debouncedSearch,
  });

  if (loading) {
    return (
      <main className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#3495A1]/15 bg-gradient-to-br from-[#F7FAFC] to-[#3495A1]/[0.06] py-20">
        <p className="text-slate-500">Loading projects...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load projects
          </h2>

          <p className="mt-2 text-sm text-red-600">{error.message}</p>

          <button
            onClick={() => {
              void reload();
            }}
            className="mt-4 rounded-xl bg-[#0A3F61] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#1F70B8]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const projects = data?.projects ?? [];
  const totalProjects = data?.pagination?.total ?? projects.length;
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <main className="space-y-7 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#3495A1]/15 bg-gradient-to-br from-white via-white to-[#3495A1]/[0.07] p-5 shadow-[0_8px_28px_rgba(10,63,97,0.05)] sm:flex-row sm:items-center sm:p-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A3F61] sm:text-4xl">Projects</h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Total Projects: {totalProjects}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              void reload();
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[#0A3F61]/15 bg-white px-5 py-3 text-sm font-semibold text-[#0A3F61] shadow-sm transition hover:border-[#3495A1]/40 hover:bg-[#F7FAFC]"
          >
            Refresh
          </button>

          <Link
            href="/dashboard/projects/create"
            className="rounded-xl bg-gradient-to-r from-[#0A3F61] via-[#1F70B8] to-[#3495A1] px-5 py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(10,63,97,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(10,63,97,0.22)]"
          >
            New Project
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3495A1]" />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-[#0A3F61]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#102A43] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#3495A1] focus:ring-4 focus:ring-[#3495A1]/10"
          />
        </div>

        <p className="text-sm font-medium text-slate-500">
          Showing {projects.length} of {data?.pagination?.total ?? 0} project(s)
        </p>
      </div>

      <ProjectsTable projects={projects} />

      {/* Pagination Component */}
      <ProjectsPagination
        page={page}
        totalPages={totalPages}
        onPrevious={() => {
          setPage((current) => Math.max(1, current - 1));
        }}
        onNext={() => {
          setPage((current) => Math.min(totalPages, current + 1));
        }}
      />
    </main>
  );
}