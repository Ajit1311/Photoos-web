'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import WorkspaceEmpty from "@/components/events/workspace/empty/WorkspaceEmpty";
import WorkspaceError from "@/components/events/workspace/error/WorkspaceError";
import WorkspaceSkeleton from "@/components/events/workspace/loading/WorkspaceSkeleton";

const STATUS_STYLES = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
  published: "border-violet-200 bg-violet-50 text-violet-700",
} as const;

function getStatusBadgeClass(status?: string) {
  return (
    STATUS_STYLES[status?.toLowerCase() as keyof typeof STATUS_STYLES] ??
    "border-slate-200 bg-slate-50 text-slate-600"
  );
}

export default function EventsListPage() {
  const {
  events,
  loading,
  error,
  reload,
  search,
  setSearch,
  page,
  pagination,
  nextPage,
  previousPage,
} = useEvents();
  if (loading) {
    return <WorkspaceSkeleton />;
  }

  if (error) {
    return (
      <WorkspaceError
        title="Unable to load events"
        description={error}
        onRetry={reload}
      />
    );
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 p-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">All Events</h1>
            <p className="mt-1 text-xs text-slate-500">
              Access and manage all photographic events, live AI galleries, and delivery history.
            </p>
          </div>
          <Link
            href="/dashboard/events/create"
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#0A3F61] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0A3F61]/95 focus:outline-none focus:ring-2 focus:ring-[#0A3F61] focus:ring-offset-2"
          >
            <Plus size={18} aria-hidden="true" />
            <span>Create New Event</span>
          </Link>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden="true"
            />

            <label htmlFor="event-search" className="sr-only">
              Search events by name or client
            </label>

            <input
              id="event-search"
              type="search"
              placeholder="Search events, client or venue..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search events by name or client"
              className="w-full rounded-2xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/20"
            />
          </div>
        </div>

        <WorkspaceEmpty
          title={search.trim() ? 'No matching events found' : 'No events found'}
          description={
            search.trim()
              ? 'Try adjusting your search to find another event.'
              : 'Create your first event.'
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">All Events</h1>
          <p className="mt-1 text-xs text-slate-500">
            Access and manage all photographic events, live AI galleries, and delivery history.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#0A3F61] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0A3F61]/95 focus:outline-none focus:ring-2 focus:ring-[#0A3F61] focus:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          <span>Create New Event</span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
            aria-hidden="true"
          />

          <label htmlFor="event-search" className="sr-only">
            Search events by name or client
          </label>

          <input
            id="event-search"
            type="search"
            placeholder="Search events by name or client..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search events by name or client"
            className="w-full rounded-2xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/20"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/dashboard/events/${event.id}`}
            className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0A3F61] focus:ring-offset-2"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-[#0A3F61]">
                  {event.client.name}
                </span>

                <span
                  className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
              </div>

              <h3
                title={event.title}
                className="line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-[#0A3F61]"
              >
                {event.title ?? 'Untitled Event'}
              </h3>

              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Users size={14} className="text-slate-400" aria-hidden="true" />
                  <span>
                    Client:{' '}
                    <strong className="text-slate-800">
                      {event.client?.name || "No Client"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Calendar size={14} className="text-slate-400" aria-hidden="true" />
                  <span>
                    {event.date
                      ? new Date(event.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "Date not set"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <MapPin size={14} className="text-slate-400" aria-hidden="true" />
                  <span className="line-clamp-1">
                    {event.venue || "No Venue"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <IndianRupee size={13} />
                {(event.financial?.budget ?? 0).toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 font-bold text-[#0A3F61]">
                {(event.gallery?.totalPhotos ?? 0).toLocaleString("en-IN")} Photos

                <ArrowUpRight
                  size={13}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
  <div className="text-sm text-slate-600">
    Showing page{" "}
    <span className="font-semibold text-slate-900">
      {page}
    </span>{" "}
    of{" "}
    <span className="font-semibold text-slate-900">
      {pagination.totalPages}
    </span>

    <span className="ml-3 text-slate-400">
      ({pagination.total.toLocaleString("en-IN")} Events)
    </span>
  </div>

  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={previousPage}
      disabled={page <= 1}
      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>

    <div className="rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-bold text-white">
      {page}
    </div>

    <button
      type="button"
      onClick={nextPage}
      disabled={page >= pagination.totalPages}
      className="rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0A3F61]/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next
    </button>
  </div>
</div>
    </div>
  );
}