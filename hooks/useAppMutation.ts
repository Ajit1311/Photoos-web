"use client";

import {
  useMutation,
  useQueryClient,
  type MutationFunctionContext,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

type UseAppMutationOptions<
  TData,
  TError = Error,
  TVariables = void,
  TOnMutateResult = unknown,
> = UseMutationOptions<
  TData,
  TError,
  TVariables,
  TOnMutateResult
> & {
  invalidateKeys?: QueryKey[];
};

export function useAppMutation<
  TData,
  TError = Error,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseAppMutationOptions<
    TData,
    TError,
    TVariables,
    TOnMutateResult
  >,
): UseMutationResult<
  TData,
  TError,
  TVariables,
  TOnMutateResult
> {

  const queryClient =
    useQueryClient();

  const {
    invalidateKeys = [],
    onSuccess,
    ...mutationOptions
  } = options;

  return useMutation({

    ...mutationOptions,

    onSuccess: async (
      data,
      variables,
      onMutateResult,
      context,
    ) => {

      await Promise.all(

        invalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries({
            queryKey,
          }),
        ),

      );

      await onSuccess?.(
        data,
        variables,
        onMutateResult,
        context,
      );

    },

  });

}