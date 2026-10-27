"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";

export type GalleryFilter =
  | "all"
  | "favorites"
  | "selected"
  | "hidden"
  | "rejected"
  | "ai";

export type GallerySort =
  | "name"
  | "size"
  | "date";

export function useGalleryFilters(
  items: GalleryPhoto[],
) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<GalleryFilter>(
      "all",
    );

  const [
    sort,
    setSort,
  ] =
    useState<GallerySort>(
      "name",
    );

  const filteredItems =
    useMemo(() => {
      let result =
        items.slice();

      // -----------------------------------------------------------------------
      // Filter
      // -----------------------------------------------------------------------

      switch (filter) {
        case "favorites":
          result =
            result.filter(
              (item) =>
                item.isFavorite,
            );
          break;

        case "selected":
          result =
            result.filter(
              (item) =>
                item.isSelected,
            );
          break;

        case "hidden":
          result =
            result.filter(
              (item) =>
                item.visibility ===
                "hidden",
            );
          break;

        case "rejected":
          result =
            result.filter(
              (item) =>
                item.visibility ===
                "rejected",
            );
          break;

        case "ai":
          result =
            result.filter(
              (item) =>
                item.aiProcessed,
            );
          break;

        case "all":
        default:
          break;
      }

      // -----------------------------------------------------------------------
      // Search
      // -----------------------------------------------------------------------

      if (search.trim()) {
        const value =
          search
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (item) =>
              item.fileName
                .toLowerCase()
                .includes(value) ||
              (
                item.aiCategory ??
                ""
              )
                .toLowerCase()
                .includes(value),
          );
      }

      // -----------------------------------------------------------------------
      // Sort
      // -----------------------------------------------------------------------

      switch (sort) {
        case "name":
          result.sort(
            (a, b) =>
              a.fileName.localeCompare(
                b.fileName,
              ),
          );
          break;

        case "size":
          result.sort(
            (a, b) =>
              a.fileSize -
              b.fileSize,
          );
          break;

        case "date":
          result.sort(
            (a, b) =>
              new Date(
                b.uploadedAt,
              ).getTime() -
              new Date(
                a.uploadedAt,
              ).getTime(),
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
    items:
      filteredItems,

    total:
      items.length,

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