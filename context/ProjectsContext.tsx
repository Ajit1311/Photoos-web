"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useProjects } from "@/hooks/useProjects";

import type {
  GetProjectsResponse,
} from "@/types/api/project";

type ProjectsProviderProps = {
  children: ReactNode;

  page?: number;

  limit?: number;

  search?: string;
};

type ProjectsContextValue = {
  data: GetProjectsResponse | null;

  loading: boolean;

  error: Error | null;

  reload: () => Promise<void>;
};

const ProjectsContext =
  createContext<ProjectsContextValue | null>(
    null,
  );

export function ProjectsProvider({
  children,
  page = 1,
  limit = 25,
  search = "",
}: ProjectsProviderProps) {

  const projects =
    useProjects({
      page,
      limit,
      search,
    });

  const value =
  useMemo(
    () => ({
      data: projects.data,
      loading: projects.loading,
      error: projects.error,

      reload: async () => {
        await projects.reload();
      },
    }),
    [
      projects.data,
      projects.loading,
      projects.error,
      projects.reload,
    ],
  );

  return (

    <ProjectsContext.Provider
      value={value}
    >

      {children}

    </ProjectsContext.Provider>

  );

}

export function useProjectsContext() {

  const context =
    useContext(
      ProjectsContext,
    );

  if (!context) {

    throw new Error(
      "useProjectsContext must be used inside ProjectsProvider.",
    );

  }

  return context;

}