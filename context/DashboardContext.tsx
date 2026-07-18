"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useDashboard } from "@/hooks/useDashboard";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

type DashboardContextValue = {
  data: DashboardSummaryResponse | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

const DashboardContext =
  createContext<DashboardContextValue | null>(
    null,
  );

type Props = {
  children: ReactNode;
};

export function DashboardProvider({
  children,
}: Props) {

  const dashboard =
    useDashboard();

  const value =
    useMemo(
      () => ({
        data: dashboard.data,
        loading: dashboard.loading,
        error: dashboard.error,
        reload: dashboard.reload,
      }),
      [
        dashboard.data,
        dashboard.loading,
        dashboard.error,
        dashboard.reload,
      ],
    );

  return (
    <DashboardContext.Provider
      value={value}
    >
      {children}
    </DashboardContext.Provider>
  );

}

export function useDashboardContext() {

  const context =
    useContext(
      DashboardContext,
    );

  if (!context) {

    throw new Error(
      "useDashboardContext must be used inside DashboardProvider.",
    );

  }

  return context;

}