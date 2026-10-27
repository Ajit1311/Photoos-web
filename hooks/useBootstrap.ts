"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  bootstrapRepository,
} from "@/lib/repositories/bootstrap.repository";

import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";


export function useBootstrap() {

  const [
    userId,
    setUserId,
  ] =
    useState<
      string | null
    >(null);


  useEffect(
    () => {

      let mounted = true;

      void supabase.auth
        .getSession()
        .then(({ data }) => {

          if (mounted) {

            setUserId(
              data.session?.user?.id ??
              null,
            );

          }

        });


      const {
        data: {
          subscription,
        },
      } =
        supabase.auth.onAuthStateChange(
          (_event, session) => {

            setUserId(
              session?.user?.id ??
              null,
            );

          },
        );


      return () => {

        mounted = false;

        subscription.unsubscribe();

      };

    },
    [],
  );


  const query =
    useAppQuery<
      BootstrapResponse
    >({

      queryKey:
        [
          "bootstrap",
          userId,
        ],

      queryFn:
        async () => {

          if (!userId) {

            throw new Error(
              "User is not authenticated.",
            );

          }

          return bootstrapRepository.load();

        },

      enabled:
        Boolean(
          userId,
        ),

      retry: 1,

      staleTime: 1000 * 30,

    });


  return {

    data:
      query.data ??
      null,

    loading:
      Boolean(
        userId,
      )
        ? query.isPending
        : true,

    refreshing:
      query.isFetching,

    error:
      query.error ??
      null,

    reload:
      async () => {

        await query.refetch();

      },

  };

}
