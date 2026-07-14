"use client";

import { useQuery } from "@tanstack/react-query";

import { useBootstrapContext } from "@/context/BootstrapContext";

import { eventRepository } from "@/lib/repositories/event.repository";

import type { Event } from "@/types/event";

export function useEvent(
  eventId: string,
) {

  const {
    data,
    loading: bootstrapLoading,
  } = useBootstrapContext();

  const studioId =
    data?.workspace.membership.studioId;

  const query =
    useQuery<Event, Error>({
      queryKey: [
        "event",
        studioId,
        eventId,
      ],

      enabled:
        !bootstrapLoading &&
        !!studioId &&
        !!eventId,

      queryFn: () =>
        eventRepository.getById(
          studioId!,
          eventId,
        ),

      staleTime:
        1000 * 60,

      gcTime:
        1000 *
        60 *
        10,

      retry: 2,

      refetchOnWindowFocus: false,
    });

  return {

    event:
      query.data ?? null,

    loading:
      bootstrapLoading ||
      query.isPending,

    error:
      query.error ?? null,

    reload:
      async () => {

        await query.refetch();

      },

  };

}