"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useBootstrapContext } from "@/context/BootstrapContext";
import { useDebounce } from "@/hooks/useDebounce";

import { eventRepository } from "@/lib/repositories/event.repository";

import type { Event } from "@/types/event";
import type { PaginationDto } from "@/types/api/project";

const PAGE_SIZE = 25;

const EMPTY_PAGINATION: PaginationDto = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

export function useEvents() {

  const {
    data,
    loading: bootstrapLoading,
  } = useBootstrapContext();

  const studioId =
    data?.workspace.membership.studioId;

  const [page, setPage] =
    useState(1);

  const [search, setSearchState] =
    useState("");

  const debouncedSearch =
    useDebounce(search);

  const setSearch = (
    value: string,
  ) => {

    setSearchState(value);

    if (page !== 1) {
      setPage(1);
    }

  };

  const query =
    useQuery({
      queryKey: [
        "events",
        studioId,
        page,
        debouncedSearch,
      ],

      enabled:
        !bootstrapLoading &&
        !!studioId,

      queryFn: () =>
        eventRepository.getAll(
          studioId!,
          page,
          PAGE_SIZE,
          debouncedSearch,
        ),

      staleTime: 60_000,

      gcTime: 600_000,

      retry: 2,

      refetchOnWindowFocus: false,
    });

  const events: Event[] =
    query.data?.events ?? [];

  const pagination =
    query.data?.pagination ??
    EMPTY_PAGINATION;

  function nextPage() {

    setPage((current) =>
      Math.min(
        current + 1,
        pagination.totalPages,
      ),
    );

  }

  function previousPage() {

    setPage((current) =>
      Math.max(
        current - 1,
        1,
      ),
    );

  }

  return {

    events,

    search,

    setSearch,

    page,

    setPage,

    pagination,

    nextPage,

    previousPage,

    loading:
      bootstrapLoading ||
      query.isPending,

    error:
      query.error
        ? query.error.message
        : null,

    reload:
      async () => {

        await query.refetch();

      },

  };

}