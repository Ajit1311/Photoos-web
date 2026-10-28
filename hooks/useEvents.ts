"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  getEvents,
} from "@/lib/api/events";

import type {
  Event,
} from "@/types/api/event";


const EVENTS_QUERY_KEY = [
  "events",
] as const;


export interface UseEventsOptions {
  projectId?: string;
}


export function useEvents(
  options?: UseEventsOptions,
) {

  const {
    studioId,
    bootstrapLoading,
  } = useStudioId();

  const projectId =
    options?.projectId;

  const query =
    useQuery<Event[], Error>({
      queryKey: [
        ...EVENTS_QUERY_KEY,
        studioId,
        projectId,
      ],

      enabled:
        !bootstrapLoading &&
        Boolean(studioId),

      queryFn:
        () =>
          getEvents(
            studioId!,
            projectId || null,
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

    events:
      query.data ?? [],


    loading:
      bootstrapLoading ||
      (Boolean(studioId) ? query.isPending : false),


    refreshing:
      query.isFetching,


    error:
      query.error ?? null,


    reload:
      query.refetch,

  };

}
