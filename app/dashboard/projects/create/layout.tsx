"use client";

import { ReactNode } from "react";

import {
  ClientsProvider,
} from "@/context/ClientsContext";

type Props = {
  children: ReactNode;
};

export default function CreateProjectLayout({
  children,
}: Props) {

  return (

    <ClientsProvider>

      {children}

    </ClientsProvider>

  );

}