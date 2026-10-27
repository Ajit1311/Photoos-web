"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AlbumCard from "./AlbumCard";

import {
  useAlbumCards,
} from "@/hooks/useAlbumCards";

import {
  useClients,
} from "@/hooks/useClients";

import type {
  AlbumCard as AlbumCardType,
} from "@/lib/api/albums";

type Filter =
  | "all"
  | "active"
  | "draft"
  | "completed"
  | "favorites";

const PAGE_SIZE = 20;

export default function AlbumsPage() {
  const router =
    useRouter();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<Filter>(
    "all",
  );

  const [
    selectedClientId,
    setSelectedClientId,
  ] = useState<string>(
    "all",
  );

  const [
    page,
    setPage,
  ] = useState(0);

  const {
    clients,
    loading: clientsLoading,
  } = useClients({
    allPages: true,
  });

  const {
    cards: albums,
    totalCount,
    hasMore,
    loading,
    refreshing,
    error,
    reload,
  } = useAlbumCards({
    clientId:
      selectedClientId === "all"
        ? null
        : selectedClientId,
    limit: PAGE_SIZE,
    offset:
      page * PAGE_SIZE,
  });

  const filteredAlbums =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return albums.filter(
        (album) => {
          const matchesSearch =
            !term ||
            album.title
              .toLowerCase()
              .includes(term) ||
            album.code
              .toLowerCase()
              .includes(term) ||
            album.slug
              .toLowerCase()
              .includes(term) ||
            (
              album.client_name ??
              ""
            )
              .toLowerCase()
              .includes(term);

          const matchesFilter =
            filter === "all"
              ? true
              : filter ===
                  "favorites"
                ? album.is_favorite
                : album.status ===
                    filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      albums,
      filter,
      search,
    ]);

  function handleOpen(
    album: AlbumCardType,
  ) {
    router.push(
      `/dashboard/albums/${album.id}`,
    );
  }

  function handleFilter(
    nextFilter: Filter,
  ) {
    setFilter(
      nextFilter,
    );

    setPage(0);
  }

  function handleClientChange(
    clientId: string,
  ) {
    setSelectedClientId(
      clientId,
    );

    setPage(0);
  }

  function handlePreviousPage() {
    setPage(
      (current) =>
        Math.max(
          current - 1,
          0,
        ),
    );
  }

  function handleNextPage() {
    if (!hasMore) {
      return;
    }

    setPage(
      (current) =>
        current + 1,
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61]/10">
                <BookOpen className="h-6 w-6 text-[#0A3F61]" />
              </div>

              <div>

                <h1 className="text-2xl font-semibold text-slate-900">
                  Albums
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your studio albums and
                  album projects.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                void reload()
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

          {/* Search And Client Filter */}
          <div className="mt-6 flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );

                  setPage(0);
                }}
                type="search"
                placeholder="Search albums, codes or clients..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#0A3F61] focus:bg-white focus:ring-2 focus:ring-[#0A3F61]/10"
              />

            </div>

            <div className="relative w-full lg:w-[280px]">

              <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={selectedClientId}
                onChange={(event) =>
                  handleClientChange(
                    event.target.value,
                  )
                }
                disabled={clientsLoading}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0A3F61] focus:bg-white focus:ring-2 focus:ring-[#0A3F61]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <option value="all">
                  {clientsLoading
                    ? "Loading clients..."
                    : "All clients"}
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.display_name}
                    </option>
                  ),
                )}

              </select>

            </div>

          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {(
              [
                [
                  "all",
                  "All",
                ],
                [
                  "active",
                  "Active",
                ],
                [
                  "draft",
                  "Draft",
                ],
                [
                  "completed",
                  "Completed",
                ],
                [
                  "favorites",
                  "Favorites",
                ],
              ] as [
                Filter,
                string,
              ][]
            ).map(
              ([
                value,
                label,
              ]) => {
                const active =
                  filter ===
                  value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      handleFilter(
                        value,
                      )
                    }
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-[#0A3F61] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >

                    {value ===
                      "favorites" && (
                      <Heart className="h-3.5 w-3.5" />
                    )}

                    {label}

                  </button>
                );
              },
            )}

          </div>

        </div>

      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc]">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6">

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  >

                    <div className="aspect-[4/3] animate-pulse bg-slate-200" />

                    <div className="space-y-3 p-4">

                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />

                      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />

                    </div>

                  </div>
                ),
              )}

            </div>
          )}

          {!loading &&
            error && (
              <div className="rounded-3xl border border-red-200 bg-white p-10 text-center">

                <p className="font-medium text-red-600">
                  Unable to load albums.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void reload()
                  }
                  className="mt-5 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-medium text-white"
                >
                  Try again
                </button>

              </div>
            )}

          {!loading &&
            !error &&
            !filteredAlbums.length && (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">

                <div className="max-w-sm text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <BookOpen className="h-7 w-7 text-slate-400" />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-slate-800">
                    No albums found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {search
                      ? "Try a different album name, code or client."
                      : selectedClientId !==
                          "all"
                        ? "No albums were found for the selected client."
                        : "Albums created for your studio will appear here."}
                  </p>

                </div>

              </div>
            )}

          {!loading &&
            !error &&
            filteredAlbums.length >
              0 && (
              <>

                <div className="mb-4 flex items-center justify-between">

                  <p className="text-sm text-slate-500">

                    Showing{" "}

                    <span className="font-semibold text-slate-700">
                      {filteredAlbums.length}
                    </span>{" "}

                    of{" "}

                    <span className="font-semibold text-slate-700">
                      {totalCount}
                    </span>{" "}

                    albums

                  </p>

                  {refreshing && (
                    <span className="text-xs text-slate-400">
                      Updating...
                    </span>
                  )}

                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                  {filteredAlbums.map(
                    (album) => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        onOpen={
                          handleOpen
                        }
                      />
                    ),
                  )}

                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">

                  <p className="text-xs text-slate-500">

                    Page{" "}

                    {page + 1}

                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={
                        page === 0
                      }
                      onClick={
                        handlePreviousPage
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={
                        !hasMore
                      }
                      onClick={
                        handleNextPage
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                  </div>

                </div>

              </>
            )}

        </div>

      </div>

    </main>
  );
}