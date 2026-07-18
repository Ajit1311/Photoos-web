"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useClients } from "@/hooks/useClients";

import type {
  ClientListResponse,
} from "@/types/api/client";

type ClientsProviderProps = {
  children: ReactNode;

  page?: number;

  limit?: number;

  search?: string;
};

type ClientsContextValue = {
  data: ClientListResponse | null;

  clients: ClientListResponse["clients"];

  pagination: ClientListResponse["pagination"] | null;

  loading: boolean;

  error: Error | null;

  reload: () => Promise<void>;
};

const ClientsContext =
  createContext<ClientsContextValue | null>(
    null,
  );

export function ClientsProvider({
  children,
  page = 1,
  limit = 25,
  search = "",
}: ClientsProviderProps) {

  const clients =
    useClients({
      page,
      limit,
      search,
    });

  const value =
    useMemo(
      () => ({

        data:
          clients.data,

        clients:
          clients.clients,

        pagination:
          clients.pagination,

        loading:
          clients.loading,

        error:
          clients.error,

        reload:
          clients.reload,

      }),
      [

        clients.data,

        clients.clients,

        clients.pagination,

        clients.loading,

        clients.error,

        clients.reload,

      ],
    );

  return (

    <ClientsContext.Provider
      value={value}
    >

      {children}

    </ClientsContext.Provider>

  );

}

export function useClientsContext() {

  const context =
    useContext(
      ClientsContext,
    );

  if (!context) {

    throw new Error(
      "useClientsContext must be used inside ClientsProvider.",
    );

  }

  return context;

}