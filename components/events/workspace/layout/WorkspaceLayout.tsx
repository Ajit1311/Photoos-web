"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function WorkspaceLayout({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-100">
      {children}
    </main>
  );
}