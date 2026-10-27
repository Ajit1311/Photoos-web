"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getFaceGalleryDashboardData,
} from "@/lib/api/face-gallery";

import type {
  FaceGalleryDashboardData,
} from "@/types/face-gallery";


export function useFaceGalleryDashboard(
  workspaceId:
    string
    | null,
) {

  const query =
    useQuery<
      FaceGalleryDashboardData,
      Error
    >({

      queryKey: [
        "face-gallery-dashboard",
        workspaceId,
      ],


      enabled:
        Boolean(
          workspaceId,
        ),


      queryFn:
        async () => {

          if (
            !workspaceId
          ) {

            throw new Error(
              "Face Gallery workspace ID is missing.",
            );

          }


          return getFaceGalleryDashboardData(
            workspaceId,
          );

        },


      staleTime:
        1000 *
        30,


      gcTime:
        1000 *
        60 *
        10,


      retry:
        1,


      refetchOnWindowFocus:
        false,

    });


  return {

    data:
      query.data ??
      null,


    loading:
      Boolean(
        workspaceId,
      ) &&
      query.isPending,


    refreshing:
      query.isFetching,


    error:
      query.error ??
      null,


    refresh:
      query.refetch,

  };

}
