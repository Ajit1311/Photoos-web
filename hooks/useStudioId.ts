"use client";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

export function useStudioId() {

  const {
    data,
    loading,
  } =
    useBootstrapContext();

  const membershipStudioId =
    data?.workspace?.membership?.studioId ??
    null;

  const workspaceStudioId =
    data?.workspace?.studio?.id ??
    null;

  const resolvedStudioId =
    membershipStudioId ??
    workspaceStudioId ??
    null;


  console.log(
    "STUDIO ID DEBUG",
    {
      loading,

      bootstrapExists:
        Boolean(data),

      workspaceExists:
        Boolean(data?.workspace),

      membershipExists:
        Boolean(
          data?.workspace?.membership,
        ),

      membershipStudioId,

      workspaceStudioId,

      resolvedStudioId,

      workspace:
        data?.workspace,

      membership:
        data?.workspace?.membership,
    },
  );


  return {

    studioId:
      resolvedStudioId,

    bootstrap:
      data,

    bootstrapLoading:
      loading,

  };

}