"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ReactNode,
  useState,
} from "react";

import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";

type Props = {
  children: ReactNode;
};

export default function QueryProvider({
  children,
}: Props) {

  const [queryClient] =
    useState(
      () =>
        new QueryClient({

          defaultOptions: {

            queries: {

              retry: 2,

              staleTime:
                1000 * 60,

              gcTime:
                1000 *
                60 *
                10,

              refetchOnWindowFocus:
                false,

              refetchOnReconnect:
                true,

            },

          },

        }),
    );

  return (

    <QueryClientProvider
      client={queryClient}
    >

      {children}

      <ReactQueryDevtools
        initialIsOpen={false}
      />

    </QueryClientProvider>

  );

}