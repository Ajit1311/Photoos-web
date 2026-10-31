"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import {
  useDashboard,
} from "@/hooks/useDashboard";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

type DashboardContextValue = {
  data: DashboardSummaryResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

const DashboardContext =
  createContext<DashboardContextValue | null>(
    null,
  );

type DashboardProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({
  children,
}: DashboardProviderProps) {

  const dashboard =
    useDashboard();

  const value =
    useMemo<DashboardContextValue>(
      () => ({

        data:
          dashboard.data,

        loading:
          dashboard.loading,

        refreshing:
          dashboard.refreshing,

        error:
          dashboard.error,

        reload:
          async () => {
            await dashboard.reload();
          },

      }),
      [
        dashboard.data,
        dashboard.loading,
        dashboard.refreshing,
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

const DEFAULT_DASHBOARD_VALUE: DashboardContextValue = {
  data: null,
  loading: false,
  refreshing: false,
  error: null,
  reload: async () => {},
};

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  return context ?? DEFAULT_DASHBOARD_VALUE;
}
