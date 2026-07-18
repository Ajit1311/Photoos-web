"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useBootstrap } from "@/hooks/useBootstrap";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

type BootstrapContextValue = {
  data: BootstrapResponse | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

const BootstrapContext =
  createContext<BootstrapContextValue | null>(
    null,
  );

type Props = {
  children: ReactNode;
};

export function BootstrapProvider({
  children,
}: Props) {
  const bootstrap = useBootstrap();

  const value = useMemo(
    () => ({
      data: bootstrap.data,
      loading: bootstrap.loading,
      error: bootstrap.error,
      reload: bootstrap.reload,
    }),
    [
      bootstrap.data,
      bootstrap.loading,
      bootstrap.error,
      bootstrap.reload,
    ],
  );

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrapContext() {
  const context = useContext(BootstrapContext);

  if (!context) {
    throw new Error(
      "useBootstrapContext must be used inside BootstrapProvider.",
    );
  }

  return context;
}