"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

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
    data: bootstrap,
    loading: bootstrapLoading,
  } =
    useBootstrapContext();


  // Use the same studio ID source
  // used by the authenticated workspace hooks.
  const studioId =
    bootstrap?.workspace?.membership?.studioId;


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
        Boolean(studioId) &&
        Boolean(projectId),


      queryFn:
        () =>
          getEvents(
            studioId!,
            projectId!,
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
      query.isPending,


    refreshing:
      query.isFetching,


    error:
      query.error ?? null,


    reload:
      query.refetch,

  };

}
