"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import BulkActions from "./BulkActions";
import GalleryFilters from "./GalleryFilters";
import GalleryHeader from "./GalleryHeader";
import GalleryToolbar from "./GalleryToolbar";
import PhotoDetails from "./PhotoDetails";
import PhotoGrid from "./PhotoGrid";
import SelectionToolbar from "./SelectionToolbar";

import { useGallery } from "@/hooks/events/useGallery";
import { useGalleryFilters } from "@/hooks/events/useGalleryFilters";

export default function GalleryWorkspace() {
  const params = useParams();

  const eventId = useMemo(() => {
    const value = params?.eventId;

    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return typeof value === "string"
      ? value
      : "";
  }, [params]);

  const {
    photos,
    loading,
    error,
  } = useGallery(eventId);

  const {
    items,
    filteredCount,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    setSort,
  } = useGalleryFilters(photos);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>([]);

  const selectedCount =
    selectedIds.length;

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

        <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load gallery
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">

      <GalleryHeader />

      <GalleryToolbar
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        total={photos.length}
        filteredCount={filteredCount}
      />

      <SelectionToolbar
        selectedCount={
          selectedCount
        }
      />

      <GalleryFilters
        value={filter}
        onChange={setFilter}
      />

      <BulkActions />

      <div className="grid gap-6 xl:grid-cols-12">

        <div className="xl:col-span-8">

          <PhotoGrid
            photos={items}
            selectedIds={
              selectedIds
            }
            onSelectionChange={
              setSelectedIds
            }
          />

        </div>

        <div className="xl:col-span-4">

          <div className="sticky top-6">
            <PhotoDetails
              photo={
                selectedIds.length > 0
                  ? items.find((p) => p.id === selectedIds[0]) || null
                  : null
              }
            />
          </div>

        </div>

      </div>

    </section>
  );
}