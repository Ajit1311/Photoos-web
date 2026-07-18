"use client";

import { ReactNode } from "react";

import {
  ProjectsProvider,
} from "@/context/ProjectsContext";

type Props = {
  children: ReactNode;
};

export default function ProjectsLayout({
  children,
}: Props) {

  return (

    <ProjectsProvider>

      {children}

    </ProjectsProvider>

  );

}