"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  getEventWorkspace,
} from "@/lib/api/events";

import type {
  EventWorkspaceResponse,
} from "@/lib/api/events";


const WORKSPACE_QUERY_KEY = [
  "event-workspace",
];


export function useWorkspace(
  eventId: string,
) {

  const { studioId } = useStudioId();

  const {
    data: bootstrap,
    loading: bootstrapLoading,
  } =
    useBootstrapContext();

  const effectiveStudioId =
    studioId ??
    bootstrap?.workspace?.membership?.studioId ??
    bootstrap?.workspace?.studio?.id ??
    (typeof window !== "undefined"
      ? localStorage.getItem("photoos_active_studio_id") ||
        localStorage.getItem("photoos_studio_id")
      : null) ??
    "";


  const query =
    useQuery<
      EventWorkspaceResponse,
      Error
    >({

      queryKey: [
        ...WORKSPACE_QUERY_KEY,
        effectiveStudioId,
        eventId,
      ],


      enabled:
        Boolean(eventId),


      queryFn:
        async () => {

          if (!eventId) {

            throw new Error(
              "Event ID is missing.",
            );

          }


          return getEventWorkspace(
            effectiveStudioId,
            eventId,
          );

        },


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

    loading:
      bootstrapLoading ||
      query.isPending,


    workspace:
      query.data?.workspace ?? null,


    dashboard:
      query.data?.dashboard ?? null,


    timeline:
      query.data?.timeline ?? [],


    summary:
      query.data?.summary ?? null,


    error:
      query.error ?? null,


    refreshing:
      query.isFetching,


    refresh:
      query.refetch,

  };

}