"use client";

import { useMemo, useState } from "react";

import type { UploadItem } from "@/types/events/upload";

export type GalleryFilter =
  | "all"
  | "queued"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type GallerySort =
  | "name"
  | "size"
  | "status";

export function useGalleryFilters(
  items: UploadItem[],
) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<GalleryFilter>("all");

  const [sort, setSort] =
    useState<GallerySort>("name");

  const filteredItems =
    useMemo(() => {
      let result = items.slice();

      if (filter !== "all") {
        result = result.filter(
          (item) =>
            item.status === filter,
        );
      }

      if (search.trim()) {
        const value =
          search.toLowerCase();

        result = result.filter(
          (item) =>
            (item.file?.name ?? "")
              .toLowerCase()
              .includes(value),
        );
      }

      switch (sort) {
        case "name":
          result.sort((a, b) =>
            a.file.name.localeCompare(
              b.file.name,
            ),
          );
          break;

        case "size":
          result.sort(
            (a, b) =>
              a.file.size -
              b.file.size,
          );
          break;

        case "status":
          result.sort((a, b) =>
            a.status.localeCompare(
              b.status,
            ),
          );
          break;
      }

      return result;
    }, [
      items,
      filter,
      search,
      sort,
    ]);

  return {
    items: filteredItems,

    total: items.length,

    filteredCount:
      filteredItems.length,

    search,
    setSearch,

    filter,
    setFilter,

    sort,
    setSort,
  };
}