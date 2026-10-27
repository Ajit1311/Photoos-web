"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  eventRepository,
} from "@/lib/repositories/event.repository";

import type {
  Event,
} from "@/types/event";

const EVENT_QUERY_KEY = [
  "event",
];

export function useEvent(
  eventId: string,
) {

  const {
    data: bootstrap,
    loading: bootstrapLoading,
  } =
    useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.membership?.studioId;

  const query =
    useQuery<Event, Error>({

      queryKey: [
        ...EVENT_QUERY_KEY,
        studioId,
        eventId,
      ],

      enabled:
        !bootstrapLoading &&
        Boolean(studioId) &&
        Boolean(eventId),

      queryFn:
        () =>
          eventRepository.getById(
            studioId!,
            eventId,
          ),

      staleTime:
        1000 * 60,

      gcTime:
        1000 * 60 * 10,

      retry:
        2,

      refetchOnWindowFocus:
        false,

    });

  return {

    event:
      query.data ?? null,

    loading:
      bootstrapLoading ||
      query.isPending,

    refreshing:
      query.isFetching,

    error:
      query.error ?? null,

    reload:
      query.refetch,

  };

}