"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

export function useAppQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >,
): UseQueryResult<TData, TError> {

  return useQuery<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >({

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 10,

    retry: 2,

    refetchOnWindowFocus: false,

    ...options,

  });

}