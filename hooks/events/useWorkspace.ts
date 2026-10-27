"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

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

  const {
    data: bootstrap,
    loading: bootstrapLoading,
  } =
    useBootstrapContext();


  const studioId =
    bootstrap?.workspace?.membership?.studioId;


  const query =
    useQuery<
      EventWorkspaceResponse,
      Error
    >({

      queryKey: [
        ...WORKSPACE_QUERY_KEY,
        studioId,
        eventId,
      ],


      enabled:
        !bootstrapLoading &&
        Boolean(studioId) &&
        Boolean(eventId),


      queryFn:
        async () => {

          if (!studioId) {

            throw new Error(
              "Active studio ID is missing.",
            );

          }


          if (!eventId) {

            throw new Error(
              "Event ID is missing.",
            );

          }


          return getEventWorkspace(
            studioId,
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