"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  getSubscriptionAccessDetails,
} from "@/lib/api/subscription/subscription";

import type {
  SubscriptionAccessDetails,
} from "@/types/subscription/subscription";


type SubscriptionAccessContextValue = {
  data: SubscriptionAccessDetails | null;

  loading: boolean;

  error: Error | null;

  reload: () => Promise<void>;
};


const SubscriptionAccessContext =
  createContext<
    SubscriptionAccessContextValue | null
  >(
    null,
  );


type SubscriptionAccessProviderProps = {
  children: ReactNode;
};


export function SubscriptionAccessProvider({
  children,
}: SubscriptionAccessProviderProps) {

  const {
    data: bootstrap,
    loading: bootstrapLoading,
  } =
    useBootstrapContext();


  const studioId =
    bootstrap
      ?.workspace
      ?.studio
      ?.id ??
    null;


  const [
    data,
    setData,
  ] =
    useState<
      SubscriptionAccessDetails | null
    >(
      null,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    error,
    setError,
  ] =
    useState<
      Error | null
    >(
      null,
    );


  const reload =
    async () => {

      if (!studioId) {

        setData(
          null,
        );

        setLoading(
          false,
        );

        return;

      }


      try {

        setLoading(
          true,
        );

        setError(
          null,
        );


        const result =
          await getSubscriptionAccessDetails(
            studioId,
          );


        setData(
          result,
        );

      } catch (
        caughtError
      ) {

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error(
                "Unable to load subscription access.",
              ),
        );

      } finally {

        setLoading(
          false,
        );

      }

    };


  useEffect(
    () => {

      if (bootstrapLoading) {

        return;

      }


      void reload();

    },
    [
      bootstrapLoading,
      studioId,
    ],
  );

  /*
   * Trial expiry watcher.
   *
   * The backend remains authoritative for subscription access.
   * This refreshes the subscription state at the exact trial
   * expiry boundary so the access gate can lock the dashboard.
   */
  useEffect(
    () => {
      if (
        !data?.is_trial ||
        !data?.trial_end_at
      ) {
        return;
      }

      const trialEndMs =
        new Date(
          data.trial_end_at,
        ).getTime();

      if (!Number.isFinite(trialEndMs)) {
        return;
      }

      const intervalId =
        window.setInterval(
          () => {
            if (
              Date.now() >=
              trialEndMs
            ) {
              window.clearInterval(
                intervalId,
              );

              void reload();
            }
          },
          1000,
        );

      return () => {
        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      data?.is_trial,
      data?.trial_end_at,
      reload,
    ],
  );



  const value =
    useMemo<
      SubscriptionAccessContextValue
    >(
      () => ({
        data,

        loading,

        error,

        reload,
      }),
      [
        data,
        loading,
        error,
      ],
    );


  return (
    <SubscriptionAccessContext.Provider
      value={value}
    >
      {children}
    </SubscriptionAccessContext.Provider>
  );

}


const DEFAULT_SUBSCRIPTION_ACCESS_VALUE: SubscriptionAccessContextValue = {
  data: null,
  loading: false,
  error: null,
  reload: async () => {},
};

export function useSubscriptionAccess() {
  const context = useContext(SubscriptionAccessContext);
  return context ?? DEFAULT_SUBSCRIPTION_ACCESS_VALUE;
}
